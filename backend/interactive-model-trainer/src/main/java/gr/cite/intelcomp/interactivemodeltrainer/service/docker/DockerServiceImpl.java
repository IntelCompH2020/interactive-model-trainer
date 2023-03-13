package gr.cite.intelcomp.interactivemodeltrainer.service.docker;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.commons.web.oidc.principal.CurrentPrincipalResolver;
import gr.cite.commons.web.oidc.principal.extractor.ClaimExtractor;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.*;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicSimilarity;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.*;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.execution.ExecutionService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.apache.commons.compress.utils.Lists;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DockerServiceImpl implements DockerService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DockerServiceImpl.class));
    private final ObjectMapper mapper;
    private final JsonHandlingService jsonHandlingService;
    private static final String fileSeparator = FileSystems.getDefault().getSeparator();
    private final ContainerServicesProperties containerServicesProperties;
    private final UserScope userScope;
    private final ExecutionService executionService;
    private final ClaimExtractor claimExtractor;
    private final CurrentPrincipalResolver currentPrincipalResolver;
    private final ContainerManagementService dockerExecutionService;

    @Autowired
    public DockerServiceImpl(JsonHandlingService jsonHandlingService, ContainerServicesProperties containerServicesProperties, UserScope userScope, ExecutionService executionService, ClaimExtractor claimExtractor, CurrentPrincipalResolver currentPrincipalResolver, ObjectMapper mapper, ContainerManagementService dockerExecutionService) {
        this.jsonHandlingService = jsonHandlingService;
        this.containerServicesProperties = containerServicesProperties;
        this.userScope = userScope;
        this.executionService = executionService;
        this.claimExtractor = claimExtractor;
        this.currentPrincipalResolver = currentPrincipalResolver;
        this.mapper = mapper;
        this.dockerExecutionService = dockerExecutionService;
        this.mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS"));
    }

    @PreDestroy
    public void destroy() {
        this.dockerExecutionService.destroy();
    }


    private void createInputFileInTempFolder(String fileName, String content, String service) throws IOException {
        Path temp_folder = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder());
        if (!Files.exists(temp_folder)) {
            Files.createDirectory(temp_folder);
        }
        Path temp_file = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder(), fileName);
        Files.createFile(temp_file);
        Files.write(temp_file, content.getBytes(StandardCharsets.UTF_8));
    }

    private void deleteInputTempFileInTempFolder(String fileName, String service) throws IOException {
        Path temp_file = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder(), fileName);
        Files.delete(temp_file);
    }

    private void checkResult(String result) {
        if (result != null && result.trim().endsWith("0")) logger.debug("Operation failed");
    }

    private String getUserId() {
        return this.claimExtractor.subjectString(this.currentPrincipalResolver.currentPrincipal());
    }

    private List<WordListEntity> applyLookup(List<WordListEntity> data, WordListLookup lookup) {
        List<WordListEntity> result = new ArrayList<>(data);
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).collect(Collectors.toList());
        }
        if (lookup.getCreator() != null && !lookup.getCreator().trim().isEmpty()) {
            result = result.stream().filter(e -> e.getCreator().equals(lookup.getCreator().trim())).collect(Collectors.toList());
        }
        if (lookup.getMine() != null && lookup.getMine()) {
            result = result.stream().filter(e -> e.getCreator().equals(getUserId())).collect(Collectors.toList());
        }
        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    private List<? extends CorpusEntity> applyLookup(List<? extends CorpusEntity> data, CorpusLookup lookup) {
        List<? extends CorpusEntity> result = new ArrayList<>(data);
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).collect(Collectors.toList());
        }
        if (lookup.getCreator() != null && !lookup.getCreator().trim().isEmpty()) {
            result = result.stream().filter(e -> e.getCreator().equals(lookup.getCreator().trim())).collect(Collectors.toList());
        }
        if (lookup.getMine() != null && lookup.getMine()) {
            result = result.stream().filter(e -> e.getCreator().equals(getUserId())).collect(Collectors.toList());
        }
        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        if (lookup.getCorpusValidFor() != null && !CorpusValidFor.ALL.equals(lookup.getCorpusValidFor())) {
            result = result.stream().filter(e -> e.getValid_for().equals(lookup.getCorpusValidFor())).collect(Collectors.toList());
        }

//        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
//            String field = lookup.getOrder().getItems().get(0);
//            System.out.println(field);
//        }
        return result;
    }

    private List<? extends ModelEntity> applyLookup(List<? extends ModelEntity> data, ModelLookup lookup) {
        List<? extends ModelEntity> result = new ArrayList<>(data);
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).collect(Collectors.toList());
        }
        if (lookup.getCreator() != null && !lookup.getCreator().trim().isEmpty()) {
            result = result.stream().filter(e -> e.getCreator().equals(lookup.getCreator().trim())).collect(Collectors.toList());
        }
        if (lookup.getMine() != null && lookup.getMine()) {
            result = result.stream().filter(e -> e.getCreator().equals(getUserId())).collect(Collectors.toList());
        }
        if (lookup.getModelType().equals(ModelType.TOPIC)) {
            TopicModelLookup topicModelLookup = (TopicModelLookup) lookup;
            if (topicModelLookup.getTrainer() != null && !topicModelLookup.getTrainer().equals("all")) {
                result = result.stream().filter(e -> e.getTrainer().contains(topicModelLookup.getTrainer().trim())).collect(Collectors.toList());
            }
        }
        if (lookup.getModelType().equals(ModelType.DOMAIN)) {
            DomainModelLookup domainModelLookup = (DomainModelLookup) lookup;
            if (domainModelLookup.getTag() != null && !domainModelLookup.getTag().trim().isEmpty()) {
                result = result.stream().filter(e -> ((DomainModelEntity)e).getTag().contains(domainModelLookup.getTag().trim())).collect(Collectors.toList());
            }
        }
        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    private List<TopicEntity> applyLookup(List<TopicEntity> data, TopicLookup lookup) {
        List<TopicEntity> result = new ArrayList<>(data);
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getLabel().toLowerCase().contains(lookup.getLike().trim())).collect(Collectors.toList());
        }
        if (lookup.getWordDescription() != null) {
            result = result.stream().filter(e -> e.getWordDescription().toLowerCase().contains(lookup.getWordDescription().trim())).collect(Collectors.toList());
        }
        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    @Override
    public List<WordListEntity> listWordLists(WordListLookup lookup) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.LIST_ALL_CMD);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        Map<String, WordListEntity> wordLists = mapper.readValue(result, new TypeReference<>() {
        });

        List<WordListEntity> data = new ArrayList<>();
        if (wordLists == null) return data;
        wordLists.forEach((key, value) -> {
            value.setLocation(key);
            data.add(value);
        });

        return applyLookup(data, lookup);
    }

    @Override
    public List<? extends CorpusEntity> listCorpus(CorpusLookup lookup) throws InterruptedException, IOException, ApiException {
        List<CorpusEntity> result = Lists.newArrayList();

        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        if (CorpusType.LOGICAL.equals(lookup.getCorpusType())) {
            command.add(ContainerServicesProperties.ManageCorpus.LIST_ALL_LOGICAL_CMD);
        } else if (CorpusType.RAW.equals(lookup.getCorpusType())) {
            command.add(ContainerServicesProperties.ManageCorpus.LIST_ALL_DOWNLOADED_CMD);
        }

        String response = this.dockerExecutionService.execCommand(CommandType.CORPUS_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        //this.executionService.updateStatus(executionEntity.getId(), Status.FINISHED);

        if (CorpusType.LOGICAL.equals(lookup.getCorpusType())) {
            Map<String, LogicalCorpusEntity> corpus = mapper.readValue(response, new TypeReference<>() {
            });
            List<LogicalCorpusEntity> data = new ArrayList<>();
            if (corpus == null) return data;
            corpus.forEach((key, value) -> {
                value.setLocation(key);
                data.add(value);
            });

            result.addAll(applyLookup(data, lookup));
        } else if (CorpusType.RAW.equals(lookup.getCorpusType())) {
            Map<String, RawCorpusEntity> corpus = mapper.readValue(response, new TypeReference<>() {
            });
            List<RawCorpusEntity> data = new ArrayList<>();
            if (corpus == null) return data;
            data.addAll(corpus.values());

            result.addAll(applyLookup(data, lookup));
        }

        //Get the raw corpora added by users
//        if (CorpusType.RAW.equals(lookup.getCorpusType())) {
//            command = new ArrayList<>(DockerProperties.ManageCorpus.ENTRY_CMD);
//            command.add(DockerProperties.ManageCorpus.LIST_ALL_LOGICAL_CMD);
//            response = this.execCommand(CommandType.CORPUS_GET, command, DockerService.MANAGE_CORPUS);
//            Map<String, RawCorpusEntity> corpus = mapper.readValue(response, new TypeReference<>() {});
//            List<RawCorpusEntity> data = new ArrayList<>();
//            if (corpus == null) return data;
//            data.addAll(corpus.values());
//
//            result.addAll(applyLookup(data, lookup));
//        }

        return result;
    }

    @Override
    public List<? extends ModelEntity> listModels(ModelLookup lookup) throws InterruptedException, IOException, ApiException {
        List<ModelEntity> result = new ArrayList<>();

        List<String> command;
        if (ModelType.DOMAIN.equals(lookup.getModelType())) {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageDomainModels.LIST_ALL_DOMAIN_CMD);
        } else if (ModelType.TOPIC.equals(lookup.getModelType())) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.LIST_ALL_TM_MODELS_CMD);
        } else {
            logger.error("ModelType not defined");
            return result;
        }

        String response = this.dockerExecutionService.execCommand(CommandType.MODEL_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        if (ModelType.DOMAIN.equals(lookup.getModelType())) {
            Map<String, DomainModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<DomainModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation("/data/DCmodels/" + key);
                data.add(value);
            });

            result.addAll(applyLookup(data, lookup));
        } else if (ModelType.TOPIC.equals(lookup.getModelType())) {
            Map<String, TopicModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<TopicModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation("/data/TMmodels/" + key);
                data.add(value);
            });

            result.addAll(applyLookup(data, lookup));
        }

        return result;
    }

    @Override
    public List<? extends ModelEntity> getModel(ModelLookup lookup, String name) throws IOException, ApiException, InterruptedException {
        List<ModelEntity> result = new ArrayList<>();

        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageTopicModels.GET_TM_MODEL_CMD);
        command.add(name);

        String response = this.dockerExecutionService.execCommand(CommandType.MODEL_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        if (ModelType.DOMAIN.equals(lookup.getModelType())) {
            Map<String, DomainModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<DomainModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation("/data/TMmodels/" + key);
                data.add(value);
            });

            result.addAll(data);
        } else if (ModelType.TOPIC.equals(lookup.getModelType())) {
            Map<String, TopicModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<TopicModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation("/data/TMmodels/" + key);
                data.add(value);
            });

            result.addAll(data);
        }

        return result;
    }

    @Override
    public void createWordList(WordListJson wordList) throws IOException, InterruptedException, ApiException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        wordList.setId(UUID.randomUUID());
        wordList.setCreator(getUserId());
        String wl = mapper.writeValueAsString(wordList);
        this.createInputFileInTempFolder(tmp_file, wl, DockerService.MANAGE_LISTS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        String cmd = String.join(" ", ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD) + " " + ContainerServicesProperties.ManageLists.CREATE_CMD + " < " + "/data/temp/" + tmp_file;
        command.add(cmd);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_CREATE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        checkResult(result);

        this.deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_LISTS);
    }

    @Override
    public void createCorpus(LogicalCorpusJson corpus) throws IOException, InterruptedException, ApiException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        corpus.setId(UUID.randomUUID());
        corpus.setCreator(UUID.fromString(getUserId()));
        String wl = mapper.writeValueAsString(corpus);
        this.createInputFileInTempFolder(tmp_file, wl, DockerService.MANAGE_CORPUS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        String cmd = String.join(" ", ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD) + " " + ContainerServicesProperties.ManageCorpus.CREATE_CMD + " < " + "/data/temp/" + tmp_file;
        command.add(cmd);

        String result = this.dockerExecutionService.execCommand(CommandType.CORPUS_CREATE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        checkResult(result);

        this.deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_CORPUS);
    }

    @Override
    public void copyWordList(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.COPY_CMD);
        command.add(name);

        this.dockerExecutionService.execCommand(CommandType.WORDLIST_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));
    }

    @Override
    public void copyCorpus(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.COPY_CMD);
        command.add(name);

        this.dockerExecutionService.execCommand(CommandType.CORPUS_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));
    }

    @Override
    public void copyModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC.equals(modelType)) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.COPY_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageDomainModels.COPY_CMD);
        }
        command.add(name);

        this.dockerExecutionService.execCommand(CommandType.MODEL_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
    }

    @Override
    public void renameWordList(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.RENAME_CMD);
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        checkResult(result);
    }

    @Override
    public void renameCorpus(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.RENAME_CMD);
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.CORPUS_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        checkResult(result);
    }

    @Override
    public void renameModel(ModelType modelType, String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC.equals(modelType)) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.RENAME_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageDomainModels.RENAME_CMD);
        }
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.MODEL_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
    }

    @Override
    public void deleteWordList(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.DELETE_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        checkResult(result);
    }

    @Override
    public void deleteCorpus(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.DELETE_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.CORPUS_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        checkResult(result);
    }

    @Override
    public void deleteModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC.equals(modelType)) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.DELETE_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageDomainModels.DELETE_CMD);
        }
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.MODEL_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
    }

    @Override
    public List<TopicEntity> listTopics(String name, TopicLookup lookup) throws IOException, ApiException, InterruptedException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageTopicModels.LIST_TOPICS_CMD);
        command.add(name);

        String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");

        ArrayList<TopicEntity> topics = mapper.readValue(response, new TypeReference<>() {});
        List<TopicEntity> data = new ArrayList<>();
        if (topics == null) return data;
        for (int i = 0; i < topics.size(); i++) {
            topics.get(i).setId(i);
        }
        data.addAll(topics);

        return new ArrayList<>(applyLookup(data, lookup));
    }

    @Override
    public TopicSimilarity getSimilarTopics(String name, Integer pairs) throws IOException, ApiException, InterruptedException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        createInputFileInTempFolder(tmp_file, pairs.toString(), DockerService.MANAGE_MODELS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        command.add(
                String.join(" ", ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD) + " " +
                        String.join(" ", List.of(ContainerServicesProperties.ManageTopicModels.GET_SIMILAR_TOPICS_CMD, name, "< /data/temp/" + tmp_file))
        );

        String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_SIMILAR, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");
        response = response.replace("\n", "");
        TopicSimilarity similarity = mapper.readValue(response, new TypeReference<>() {});

        deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_MODELS);
        return similarity;
    }

    @Override
    public void setTopicLabels(String name, ArrayList<String> labels) throws IOException, ApiException, InterruptedException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        String contents = jsonHandlingService.toJsonSafe(labels);
        createInputFileInTempFolder(tmp_file, contents, DockerService.MANAGE_MODELS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        command.add(
                String.join(" ", ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD) + " " +
                        String.join(" ", List.of(ContainerServicesProperties.ManageTopicModels.SET_TPC_LABELS_CMD, name, "< /data/temp/" + tmp_file))
        );

        String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_LABELS_SET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");
        response = response.replace("\n", "");

        checkResult(response);

        deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_MODELS);
    }

    @Override
    public void fuseTopics(String name, ArrayList<Integer> topics) throws IOException, ApiException, InterruptedException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        String contents = jsonHandlingService.toJsonSafe(topics);
        createInputFileInTempFolder(tmp_file, contents, DockerService.MANAGE_MODELS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        command.add(
                String.join(" ", ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD) + " " +
                        String.join(" ", List.of(ContainerServicesProperties.ManageTopicModels.FUSE_TOPICS_CMD, name, "< /data/temp/" + tmp_file))
        );

        String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_FUSE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");
        response = response.replace("\n", "");

        checkResult(response);

        deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_MODELS);
    }

    @Override
    public void sortTopics(String name) throws IOException, ApiException, InterruptedException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageTopicModels.SORT_TOPICS_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.TOPIC_SORT, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
    }

    @Override
    public void deleteTopics(String name, ArrayList<Integer> topics) throws IOException, ApiException, InterruptedException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        String contents = jsonHandlingService.toJsonSafe(topics);
        createInputFileInTempFolder(tmp_file, contents, DockerService.MANAGE_MODELS);

        List<String> command = new ArrayList<>();
        command.add("/bin/sh");
        command.add("-c");
        command.add(
                String.join(" ", ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD) + " " +
                        String.join(" ", List.of(ContainerServicesProperties.ManageTopicModels.DELETE_TOPICS_CMD, name, "< /data/temp/" + tmp_file))
        );

        String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");
        response = response.replace("\n", "");

        checkResult(response);

        deleteInputTempFileInTempFolder(tmp_file, DockerService.MANAGE_MODELS);
    }
}
