package gr.cite.intelcomp.interactivemodeltrainer.service.docker;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.cache.*;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.*;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.*;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks.config.CheckTasksSchedulerEventConfig;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicSimilarity;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.*;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import jakarta.annotation.PreDestroy;
import org.apache.commons.compress.utils.Lists;
import org.apache.commons.io.FileUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Unmodifiable;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODELS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.model.builder.BaseBuilder.extractId;

@Service
public class DockerServiceImpl implements DockerService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DockerServiceImpl.class));
    private final ObjectMapper mapper;
    private final JsonHandlingService jsonHandlingService;
    private final ContainerServicesProperties containerServicesProperties;
    private final ContainerManagementService dockerExecutionService;
    private final DomainClassificationParametersService domainClassificationParametersService;
    private final CacheLibrary cacheLibrary;
    private final CheckTasksSchedulerEventConfig checkTasksSchedulerEventConfig;
    private final ApplicationContext applicationContext;
    private final UserScope userScope;

    @Autowired
    public DockerServiceImpl(JsonHandlingService jsonHandlingService, ContainerServicesProperties containerServicesProperties, ObjectMapper mapper, ContainerManagementService dockerExecutionService, DomainClassificationParametersService domainClassificationParametersService, CacheLibrary cacheLibrary, CheckTasksSchedulerEventConfig checkTasksSchedulerEventConfig, ApplicationContext applicationContext) {
        this.jsonHandlingService = jsonHandlingService;
        this.containerServicesProperties = containerServicesProperties;
        this.mapper = mapper;
        this.dockerExecutionService = dockerExecutionService;
        this.domainClassificationParametersService = domainClassificationParametersService;
        this.cacheLibrary = cacheLibrary;
        this.checkTasksSchedulerEventConfig = checkTasksSchedulerEventConfig;
        this.applicationContext = applicationContext;
        this.userScope = applicationContext.getBean(UserScope.class);
        this.mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS"));
    }

    @PreDestroy
    public void destroy() {
        this.dockerExecutionService.destroy();
    }

    @Override
    public void createInputFileInTempFolder(String fileName, String content, String service) throws IOException {
        Path temp_folder = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder());
        if (!Files.exists(temp_folder)) {
            Files.createDirectory(temp_folder);
        }
        Path temp_file = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder(), fileName);
        Files.createFile(temp_file);
        Files.writeString(temp_file, content);
    }

    @Override
    public void deleteInputTempFileInTempFolder(String fileName, String service) throws IOException {
        Path temp_file = Paths.get(this.containerServicesProperties.getServices().get(service).getTempFolder(), fileName);
        Files.delete(temp_file);
    }

    private void checkResult(String result) {
        if (result != null && result.trim().endsWith("0")) logger.debug("Operation failed");
    }

    private String getUserId() {
        UUID user = this.userScope.getUserIdSafe();
        if (user != null) return user.toString();
        else return "-";
    }

    private @NotNull @Unmodifiable List<String> getUserIdsFromUsername(String username) {
        UserQuery userQuery = applicationContext.getBean(UserQuery.class);
        UserEntity user = userQuery
                .usernames(username)
                .first();
        if (user != null) return List.of(user.getId().toString(), user.getSubjectId());
        else return List.of("-");
    }

    private @NotNull @Unmodifiable List<String> getUserIdsFromId(String id) {
        UserQuery userQuery = applicationContext.getBean(UserQuery.class);
        UserEntity user = userQuery
                .ids(UUID.fromString(id))
                .first();
        if (user != null) return List.of(user.getId().toString(), user.getSubjectId());
        else return List.of("-");
    }

    private List<WordListEntity> applyWordlistLookup(List<WordListEntity> data, @NotNull WordListLookup lookup) {
        List<WordListEntity> result = new ArrayList<>(data);
        String currentUser = getUserId();
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).toList();
        }
        if (lookup.getVisibilities() != null && !lookup.getVisibilities().isEmpty()) {
            result = result.stream().filter(e -> lookup.getVisibilities().contains(e.getVisibility())).toList();
        }
        if (lookup.getCreator() != null && !lookup.getCreator().isEmpty()) {
            List<String> idsFromUsername = getUserIdsFromUsername(lookup.getCreator());
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromUsername.contains(e.getCreator()))
                    .toList();
        }
        if (!currentUser.equals("-") && lookup.getMine() != null && lookup.getMine()) {
            List<String> idsFromId = getUserIdsFromId(currentUser);
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromId.contains(e.getCreator()))
                    .toList();
        }
        if (lookup.getCreatedAt() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getCreation_date().toInstant().isAfter(lookup.getCreatedAt()) &&
                            e.getCreation_date().toInstant().isBefore(lookup.getCreatedAt().plus(1, ChronoUnit.DAYS)))
                    .toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<WordListEntity> byNme = Comparator.comparing(WordListEntity::getName);
            Comparator<WordListEntity> byCreationDate = Comparator.comparing(WordListEntity::getCreationMilliseconds);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                if (orderItem.equals("name"))
                    result = result.stream().sorted(byNme.reversed()).toList();
                else if (orderItem.equals("creation_date"))
                    result = result.stream().sorted(byCreationDate.reversed()).toList();
            } else {
                if (orderItem.equals("name")) result = result.stream().sorted(byNme).toList();
                else if (orderItem.equals("creation_date"))
                    result = result.stream().sorted(byCreationDate).toList();
            }
        }

        return result;
    }

    private List<RawCorpusEntity> applyRawCorpusLookup(List<RawCorpusEntity> data, @NotNull CorpusLookup lookup) {
        List<RawCorpusEntity> result = new ArrayList<>(data);
        String currentUser = getUserId();
        if (lookup.getLike() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim()))
                    .toList();
        }
        if (lookup.getCreator() != null && !lookup.getCreator().isEmpty()) {
            List<String> idsFromUsername = getUserIdsFromUsername(lookup.getCreator());
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromUsername.contains(e.getCreator()))
                    .toList();
        }
        if (!currentUser.equals("-") && lookup.getMine() != null && lookup.getMine()) {
            List<String> idsFromId = getUserIdsFromId(currentUser);
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromId.contains(e.getCreator()))
                    .toList();
        }
        if (lookup.getCorpusValidFor() != null && CorpusValidFor.ALL != lookup.getCorpusValidFor()) {
            result = result
                    .stream()
                    .filter(e -> e.getValid_for() == lookup.getCorpusValidFor())
                    .toList();
        }
        if (lookup.getCreatedAt() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getDownload_date().toInstant().isAfter(lookup.getCreatedAt()) &&
                            e.getDownload_date().toInstant().isBefore(lookup.getCreatedAt().plus(1, ChronoUnit.DAYS)))
                    .toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<RawCorpusEntity> byName = Comparator.comparing(RawCorpusEntity::getName);
            Comparator<RawCorpusEntity> byDownloadDate = Comparator.comparing(RawCorpusEntity::getDownloadedAtMilliseconds);
            Comparator<RawCorpusEntity> byRecords = Comparator.comparing(RawCorpusEntity::getRecords);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName.reversed()).toList();
                    case "download_date" -> result.stream().sorted(byDownloadDate.reversed()).toList();
                    case "records" -> result.stream().sorted(byRecords.reversed()).toList();
                    default -> result;
                };
            } else {
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName).toList();
                    case "download_date" -> result.stream().sorted(byDownloadDate).toList();
                    case "records" -> result.stream().sorted(byRecords).toList();
                    default -> result;
                };
            }
        }

        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    private List<LogicalCorpusEntity> applyLogicalCorpusLookup(List<LogicalCorpusEntity> data, @NotNull CorpusLookup lookup) {
        List<LogicalCorpusEntity> result = new ArrayList<>(data);
        String currentUser = getUserId();
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).toList();
        }
        if (lookup.getVisibilities() != null && !lookup.getVisibilities().isEmpty()) {
            result = result.stream().filter(e -> lookup.getVisibilities().contains(e.getVisibility())).toList();
        }
        if (lookup.getCreator() != null && !lookup.getCreator().isEmpty()) {
            List<String> idsFromUsername = getUserIdsFromUsername(lookup.getCreator());
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromUsername.contains(e.getCreator()))
                    .toList();
        }
        if (!currentUser.equals("-") && lookup.getMine() != null && lookup.getMine()) {
            List<String> idsFromId = getUserIdsFromId(currentUser);
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromId.contains(e.getCreator()))
                    .toList();
        }
        if (lookup.getCorpusValidFor() != null && CorpusValidFor.ALL != lookup.getCorpusValidFor()) {
            result = result
                    .stream()
                    .filter(e -> e.getValid_for() == lookup.getCorpusValidFor())
                    .toList();
        }
        if (lookup.getCreatedAt() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getCreation_date().toInstant().isAfter(lookup.getCreatedAt()) &&
                            e.getCreation_date().toInstant().isBefore(lookup.getCreatedAt().plus(1, ChronoUnit.DAYS)))
                    .toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<LogicalCorpusEntity> byName = Comparator.comparing(LogicalCorpusEntity::getName);
            Comparator<LogicalCorpusEntity> byCreationDate = Comparator.comparing(LogicalCorpusEntity::getCreationMilliseconds);
            Comparator<LogicalCorpusEntity> byValidFor = Comparator.comparing(LogicalCorpusEntity::getValid_for);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName.reversed()).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate.reversed()).toList();
                    case "valid_for" -> result.stream().sorted(byValidFor.reversed()).toList();
                    default -> result;
                };
            } else {
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate).toList();
                    case "valid_for" -> result.stream().sorted(byValidFor).toList();
                    default -> result;
                };
            }
        }

        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();
        result = result.stream().filter(d ->
                d.getCreator() != null
                && !d.getCreator().equals("-")
                && !extractId(d.getCreator(), users).equals(userScope.getUserIdSafe().toString()))
                .collect(Collectors.toList());

        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    private List<TopicModelListingEntity> applyTopicModelLookup(List<TopicModelEntity> data, @NotNull ModelLookup lookup, List<UserEntity> users) {
        List<TopicModelEntity> result = new ArrayList<>(data);

        result = result.stream().filter(entity -> {
            if (Visibility.Public == entity.getVisibility()) return true;
            else {
                if (!userScope.isSet()) return false;
                else return entity.getCreator() != null
                        && !entity.getCreator().equals("-")
                        && extractId(entity.getCreator(), users).equals(userScope.getUserIdSafe().toString());
            }
        }).toList();

        String currentUser = getUserId();
        if (lookup.getLike() != null) {
            result = result.stream().filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim())).toList();
        }
        if (lookup.getVisibilities() != null && !lookup.getVisibilities().isEmpty()) {
            result = result.stream().filter(e -> lookup.getVisibilities().contains(e.getVisibility())).toList();
        }
        if (lookup.getCreator() != null && !lookup.getCreator().isEmpty()) {
            List<String> idsFromUsername = getUserIdsFromUsername(lookup.getCreator());
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromUsername.contains(e.getCreator()))
                    .toList();
        }
        if (!currentUser.equals("-") && lookup.getMine() != null && lookup.getMine()) {
            List<String> idsFromId = getUserIdsFromId(currentUser);
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromId.contains(e.getCreator()))
                    .toList();
        }
        TopicModelLookup topicModelLookup = (TopicModelLookup) lookup;
        if (topicModelLookup.getTrainer() != null && !topicModelLookup.getTrainer().equals("all")) {
            result = result.stream().filter(e -> e.getTrainer().contains(topicModelLookup.getTrainer().trim())).toList();
        }
        if (topicModelLookup.getHierarchyLevel() != null) {
            result = result.stream().filter(e -> e.getHierarchyLevel().equals(topicModelLookup.getHierarchyLevel())).toList();
        }
        if (lookup.getCreatedAt() != null) {
            result = result.stream().filter(e -> e.getCreation_date().toInstant().isAfter(lookup.getCreatedAt()) &&
                    e.getCreation_date().toInstant().isBefore(lookup.getCreatedAt().plus(1, ChronoUnit.DAYS))).toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<TopicModelEntity> byName = Comparator.comparing(TopicModelEntity::getName);
            Comparator<TopicModelEntity> byCreationDate = Comparator.comparing(TopicModelEntity::getCreationMilliseconds);
            Comparator<TopicModelEntity> byType = Comparator.comparing(TopicModelEntity::getTrainer);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName.reversed()).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate.reversed()).toList();
                    case "type" -> result.stream().sorted(byType.reversed()).toList();
                    default -> result;
                };
            } else {
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate).toList();
                    case "type" -> result.stream().sorted(byType).toList();
                    default -> result;
                };
            }
        }

        List<TopicModelListingEntity> collectedModels = result.stream()
                .filter(entity -> entity.getHierarchyLevel() == 0)
                .toList()
                .stream()
                .map(DockerServiceImpl::topicModelListingFromModel)
                .collect(Collectors.toList());
        List<TopicModelEntity> collectedSubmodels = result.stream()
                .filter(entity -> entity.getHierarchyLevel() > 0)
                .toList();

        if (lookup.getPage() != null) {
            collectedModels = collectedModels.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), collectedModels.size()));
        }

        for (TopicModelEntity submodel : collectedSubmodels) {
            String corpus = submodel.getCorpus()
                    .replaceAll("^(.*)/", "")
                    .replace("Subcorpus created from ", "")
                    .replace(".json", "");
            collectedModels.forEach(entity -> {
                if (entity.getName().equals(corpus))
                    entity.getSubmodels().add(submodel);
            });

        }
        return collectedModels;
    }

    private static TopicModelListingEntity topicModelListingFromModel(TopicModelEntity entity) {
        TopicModelListingEntity result = new TopicModelListingEntity();
        result.setId(entity.getId());
        result.setCorpus(entity.getCorpus());
        result.setCreator(entity.getCreator());
        result.setDescription(entity.getDescription());
        result.setHierarchyLevel(entity.getHierarchyLevel());
        result.setParams(entity.getParams());
        result.setTrainer(entity.getTrainer());
        result.setLocation(entity.getLocation());
        result.setName(entity.getName());
        result.setCreation_date(entity.getCreation_date());
        result.setVisibility(entity.getVisibility());
        result.setSubmodels(new ArrayList<>());
        return result;
    }

    private List<DomainModelEntity> applyDomainModelLookup(List<DomainModelEntity> data, @NotNull ModelLookup lookup) {
        List<DomainModelEntity> result = new ArrayList<>(data);
        String currentUser = getUserId();
        if (lookup.getLike() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getName().toLowerCase().contains(lookup.getLike().trim()))
                    .toList();
        }
        if (lookup.getVisibilities() != null && !lookup.getVisibilities().isEmpty()) {
            result = result
                    .stream()
                    .filter(e -> lookup.getVisibilities().contains(e.getVisibility()))
                    .toList();
        }
        if (lookup.getCreator() != null && !lookup.getCreator().isEmpty()) {
            List<String> idsFromUsername = getUserIdsFromUsername(lookup.getCreator());
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromUsername.contains(e.getCreator()))
                    .toList();
        }
        if (!currentUser.equals("-") && lookup.getMine() != null && lookup.getMine()) {
            List<String> idsFromId = getUserIdsFromId(currentUser);
            result = result
                    .stream()
                    .filter(e -> e.getCreator() != null && idsFromId.contains(e.getCreator()))
                    .toList();
        }
        DomainModelLookup domainModelLookup = (DomainModelLookup) lookup;
        if (domainModelLookup.getTag() != null && !domainModelLookup.getTag().trim().isEmpty()) {
            result = result
                    .stream()
                    .filter(e -> e.getTag().contains(domainModelLookup.getTag().trim()))
                    .toList();
        }
        if (lookup.getCreatedAt() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getCreation_date().toInstant().isAfter(lookup.getCreatedAt()) &&
                            e.getCreation_date().toInstant().isBefore(lookup.getCreatedAt().plus(1, ChronoUnit.DAYS)))
                    .toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<DomainModelEntity> byName = Comparator.comparing(DomainModelEntity::getName);
            Comparator<DomainModelEntity> byCreationDate = Comparator.comparing(DomainModelEntity::getCreationMilliseconds);
            Comparator<DomainModelEntity> byTag = Comparator.comparing(DomainModelEntity::getTag);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName.reversed()).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate.reversed()).toList();
                    case "tag" -> result.stream().sorted(byTag.reversed()).toList();
                    default -> result;
                };
            } else {
                result = switch (orderItem) {
                    case "name" -> result.stream().sorted(byName).toList();
                    case "creation_date" -> result.stream().sorted(byCreationDate).toList();
                    case "tag" -> result.stream().sorted(byTag).toList();
                    default -> result;
                };
            }
        }

        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    private List<TopicEntity> applyTopicLookup(List<TopicEntity> data, @NotNull TopicLookup lookup) {
        List<TopicEntity> result = new ArrayList<>(data);
        if (lookup.getLike() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getLabel().toLowerCase().contains(lookup.getLike().trim()))
                    .toList();
        }
        if (lookup.getWordDescription() != null) {
            result = result
                    .stream()
                    .filter(e -> e.getWordDescription().toLowerCase().contains(lookup.getWordDescription().trim()))
                    .toList();
        }
        if (lookup.getOrder() != null && !lookup.getOrder().isEmpty()) {
            String orderItem = lookup.getOrder().getItems().get(0);
            Comparator<TopicEntity> byId = Comparator.comparing(TopicEntity::getId);
            Comparator<TopicEntity> bySize = Comparator.comparing(TopicEntity::getSizeNumber);
            Comparator<TopicEntity> byLabel = Comparator.comparing(TopicEntity::getLabel);
            Comparator<TopicEntity> byDocsActive = Comparator.comparing(TopicEntity::getDocsActiveNumber);
            Comparator<TopicEntity> byCoherence = Comparator.comparing(TopicEntity::getTopicCoherenceNumber);
            Comparator<TopicEntity> byEntropy = Comparator.comparing(TopicEntity::getTopicEntropyNumber);
            if (orderItem.contains("-")) {
                orderItem = orderItem.replace("-", "");
                result = switch (orderItem) {
                    case "id" -> result.stream().sorted(byId.reversed()).toList();
                    case "size" -> result.stream().sorted(bySize.reversed()).toList();
                    case "label" -> result.stream().sorted(byLabel.reversed()).toList();
                    case "docsactive" -> result.stream().sorted(byDocsActive.reversed()).toList();
                    case "topiccoherence" -> result.stream().sorted(byCoherence.reversed()).toList();
                    case "topicentropy" -> result.stream().sorted(byEntropy.reversed()).toList();
                    default -> result;
                };
            } else {
                result = switch (orderItem) {
                    case "id" -> result.stream().sorted(byId).toList();
                    case "size" -> result.stream().sorted(bySize).toList();
                    case "label" -> result.stream().sorted(byLabel).toList();
                    case "docsactive" -> result.stream().sorted(byDocsActive).toList();
                    case "topiccoherence" -> result.stream().sorted(byCoherence).toList();
                    case "topicentropy" -> result.stream().sorted(byEntropy).toList();
                    default -> result;
                };
            }
        }

        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }
        return result;
    }

    @Override
    public List<WordListEntity> listWordLists(WordListLookup lookup) throws InterruptedException, IOException, ApiException {
        List<WordListEntity> data = new ArrayList<>();
        WordlistCachedEntity cached = (WordlistCachedEntity) cacheLibrary.get(WordlistCachedEntity.CODE);
        if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
            List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageLists.LIST_ALL_CMD);

            String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

            Map<String, WordListEntity> wordLists = mapper.readValue(result, new TypeReference<>() {
            });

            if (wordLists == null) return data;
            wordLists.forEach((key, value) -> {
                value.setLocation(key);
                data.add(value);
            });
            WordlistCachedEntity toCache = new WordlistCachedEntity();
            toCache.setPayload(data);
            cacheLibrary.update(toCache);
        } else {
            data.addAll(cached.getPayload());
        }

        return applyWordlistLookup(data, lookup);
    }

    @Override
    public List<? extends CorpusEntity> listCorpus(CorpusLookup lookup) throws InterruptedException, IOException, ApiException {
        List<CorpusEntity> result = Lists.newArrayList();
        if (CorpusType.LOGICAL == lookup.getCorpusType()) {
            List<LogicalCorpusEntity> data = new ArrayList<>();
            LogicalCorpusCachedEntity cached = (LogicalCorpusCachedEntity) cacheLibrary.get(LogicalCorpusCachedEntity.CODE);
            if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
                List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
                command.add(ContainerServicesProperties.ManageCorpus.LIST_ALL_LOGICAL_CMD);

                String response = this.dockerExecutionService.execCommand(CommandType.CORPUS_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

                Map<String, LogicalCorpusEntity> corpus = mapper.readValue(response, new TypeReference<>() {
                });
                if (corpus == null) return data;
                corpus.forEach((key, value) -> {
                    value.setLocation(key);
                    data.add(value);
                });
                LogicalCorpusCachedEntity toCache = new LogicalCorpusCachedEntity();
                toCache.setPayload(data);
                cacheLibrary.update(toCache);
            } else {
                data.addAll(cached.getPayload());
            }
            result.addAll(applyLogicalCorpusLookup(data, lookup));
        } else if (CorpusType.RAW == lookup.getCorpusType()) {
            List<RawCorpusEntity> data = new ArrayList<>();
            RawCorpusCachedEntity cached = (RawCorpusCachedEntity) cacheLibrary.get(RawCorpusCachedEntity.CODE);
            if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
                List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
                command.add(ContainerServicesProperties.ManageCorpus.LIST_ALL_DOWNLOADED_CMD);

                String response = this.dockerExecutionService.execCommand(CommandType.CORPUS_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

                Map<String, RawCorpusEntity> corpus = mapper.readValue(response, new TypeReference<>() {
                });
                if (corpus == null) return data;
                data.addAll(corpus.values());
                RawCorpusCachedEntity toCache = new RawCorpusCachedEntity();
                toCache.setPayload(data);
                cacheLibrary.update(toCache);
            } else {
                data.addAll(cached.getPayload());
            }
            result.addAll(applyRawCorpusLookup(data, lookup));
        }

        return result;
    }

    @Override
    public List<? extends ModelEntity> listModels(ModelLookup lookup, List<UserEntity> users) throws InterruptedException, IOException, ApiException {
        List<ModelEntity> result = new ArrayList<>();

        if (ModelType.DOMAIN == lookup.getModelType()) {
            List<DomainModelEntity> data = new ArrayList<>();
            DomainModelCachedEntity cached = (DomainModelCachedEntity) cacheLibrary.get(DomainModelCachedEntity.CODE);
            if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
                List<String> command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD(
                        containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class))
                );
                command.add(ContainerServicesProperties.ManageDomainModels.LIST_ALL_DOMAIN_CMD);

                String response = this.dockerExecutionService.execCommand(CommandType.MODEL_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

                Map<String, DomainModelEntity> models = mapper.readValue(response, new TypeReference<>() {
                });
                if (models == null) return data;
                models.forEach((key, value) -> {
                    value.setLocation(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + key);
                    data.add(value);
                });
                DomainModelCachedEntity toCache = new DomainModelCachedEntity();
                toCache.setPayload(data);
                cacheLibrary.update(toCache);
            } else {
                data.addAll(cached.getPayload());
            }
            result.addAll(applyDomainModelLookup(data, lookup));
        } else if (ModelType.TOPIC == lookup.getModelType()) {
            List<TopicModelEntity> data = new ArrayList<>();
            TopicModelCachedEntity cached = (TopicModelCachedEntity) cacheLibrary.get(TopicModelCachedEntity.CODE);
            if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
                List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
                command.add(ContainerServicesProperties.ManageTopicModels.LIST_ALL_TM_MODELS_CMD);

                String response = this.dockerExecutionService.execCommand(CommandType.MODEL_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

                Map<String, TopicModelEntity> models = mapper.readValue(response, new TypeReference<>() {
                });
                if (models == null) return data;
                models.forEach((key, value) -> {
                    value.setLocation(TM_MODELS_ROOT + key);
                    data.add(value);
                });
                TopicModelCachedEntity toCache = new TopicModelCachedEntity();
                toCache.setPayload(data);
                cacheLibrary.update(toCache);
            } else {
                data.addAll(cached.getPayload());
            }
            result.addAll(applyTopicModelLookup(data, lookup, users));
        } else {
            logger.error("ModelType not defined");
            return result;
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

        if (ModelType.DOMAIN == lookup.getModelType()) {
            Map<String, DomainModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<DomainModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + key);
                data.add(value);
            });

            result.addAll(data);
        } else if (ModelType.TOPIC == lookup.getModelType()) {
            Map<String, TopicModelEntity> models = mapper.readValue(response, new TypeReference<>() {
            });
            List<TopicModelEntity> data = new ArrayList<>();
            if (models == null) return data;
            models.forEach((key, value) -> {
                value.setLocation(TM_MODELS_ROOT + key);
                data.add(value);
            });

            result.addAll(data);
        }

        return result;
    }

    @Override
    public void createWordList(WordListJson wordList, boolean isNew) throws IOException, InterruptedException, ApiException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        if (isNew) {
            wordList.setId(UUID.randomUUID());
            wordList.setCreator(getUserId());
        }
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
        cacheLibrary.setDirtyByKey(WordlistCachedEntity.CODE);
    }

    @Override
    public void createCorpus(LogicalCorpusJson corpus, boolean isNew) throws IOException, InterruptedException, ApiException {
        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        if (isNew) {
            corpus.setId(UUID.randomUUID());
            corpus.setCreator(getUserId());
        }
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
        cacheLibrary.setDirtyByKey(LogicalCorpusCachedEntity.CODE);
    }

    @Override
    public void createCorpus(RawCorpus corpus, String generatedName) throws IOException {
        Path datasetMetaPath = Path.of(this.containerServicesProperties.getCorpusService().getParquetFolder(), "datasetMeta.json");
        String content = Files.readString(datasetMetaPath, Charset.defaultCharset());
        Map<String, RawCorpusJson> existingCorpora = jsonHandlingService.fromJson(Map.class, content);
        existingCorpora.put(generatedName, new RawCorpusJson(corpus));
        Files.writeString(datasetMetaPath, jsonHandlingService.toJson(existingCorpora), Charset.defaultCharset());
        cacheLibrary.setDirtyByKey(RawCorpusCachedEntity.CODE);
    }

    @Override
    public void copyWordList(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.COPY_CMD);
        command.add(name);

        this.dockerExecutionService.execCommand(CommandType.WORDLIST_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));
        cacheLibrary.setDirtyByKey(WordlistCachedEntity.CODE);
    }

    @Override
    public void copyCorpus(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.COPY_CMD);
        command.add(name);

        this.dockerExecutionService.execCommand(CommandType.CORPUS_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));
        cacheLibrary.setDirtyByKey(LogicalCorpusCachedEntity.CODE);
    }

    @Override
    public void copyModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC == modelType) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.COPY_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD(
                    containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class))
            );
            command.add(ContainerServicesProperties.ManageDomainModels.COPY_CMD);
        }
        command.add(name);
        command.add(name + "-copy");

        this.dockerExecutionService.execCommand(CommandType.MODEL_COPY, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
        if (ModelType.TOPIC == modelType) {
            cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
        } else {
            cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
        }
    }

    @Override
    public void renameWordList(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.RENAME_CMD);
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        checkResult(result);
        cacheLibrary.setDirtyByKey(WordlistCachedEntity.CODE);
    }

    @Override
    public void renameCorpus(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.RENAME_CMD);
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.CORPUS_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        checkResult(result);
        cacheLibrary.setDirtyByKey(LogicalCorpusCachedEntity.CODE);
    }

    @Override
    public void renameRawCorpus(String oldName, String newName, String source) throws IOException {
        Path datasetMetaPath = Path.of(this.containerServicesProperties.getCorpusService().getParquetFolder(), "datasetMeta.json");
        String content = Files.readString(datasetMetaPath, Charset.defaultCharset());
        Map<String, Map<String, Object>> existingCorpora = jsonHandlingService.fromJson(Map.class, content);
        existingCorpora.forEach((key, value) -> {
            if (value.get("name").equals(oldName) && value.get("source").equals(source)) value.put("name", newName);
        });
        Files.writeString(datasetMetaPath, jsonHandlingService.toJson(existingCorpora), Charset.defaultCharset());
        cacheLibrary.setDirtyByKey(RawCorpusCachedEntity.CODE);
    }

    @Override
    public void renameModel(ModelType modelType, String oldName, String newName) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC == modelType) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.RENAME_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD(
                    containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class))
            );
            command.add(ContainerServicesProperties.ManageDomainModels.RENAME_CMD);
        }
        command.add(oldName);
        command.add(newName);

        String result = this.dockerExecutionService.execCommand(CommandType.MODEL_RENAME, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
        if (ModelType.TOPIC == modelType) {
            cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
        } else {
            cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
        }
    }

    @Override
    public void deleteWordList(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageLists.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageLists.DELETE_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.WORDLIST_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_LISTS));

        checkResult(result);
        cacheLibrary.setDirtyByKey(WordlistCachedEntity.CODE);
    }

    @Override
    public void deleteCorpus(String name) throws InterruptedException, IOException, ApiException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageCorpus.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageCorpus.DELETE_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.CORPUS_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_CORPUS));

        checkResult(result);
        cacheLibrary.setDirtyByKey(LogicalCorpusCachedEntity.CODE);
    }

    @Override
    public void deleteModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException {
        List<String> command;
        if (ModelType.TOPIC == modelType) {
            command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.DELETE_CMD);
        } else {
            command = new ArrayList<>(ContainerServicesProperties.ManageDomainModels.MANAGER_ENTRY_CMD(
                    containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class))
            );
            command.add(ContainerServicesProperties.ManageDomainModels.DELETE_CMD);
        }
        command.add(name);

        String projectName = domainClassificationParametersService.getConfigurationModel(name).getTag();

        String result = this.dockerExecutionService.execCommand(CommandType.MODEL_DELETE, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
        if (ModelType.TOPIC == modelType) {
            cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
            cacheLibrary.remove(TopicCachedEntity.CODE + name);
        } else {
            String root = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class);
            URI pathToDelete = Path.of(root, projectName + "_classification", "models", name).toUri();
            File directory = new File(pathToDelete);
            if (directory.exists()) {
                FileUtils.deleteDirectory(directory);
            } else {
                logger.debug("No model folder on path '{}' found for deletion. Skipping...", pathToDelete.getPath());
            }
            cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
        }
    }

    @Override
    public List<TopicEntity> listTopics(String name, TopicLookup lookup) throws IOException, ApiException, InterruptedException {
        List<TopicEntity> data = new ArrayList<>();
        TopicCachedEntity cached = (TopicCachedEntity) cacheLibrary.get(TopicCachedEntity.CODE + name);
        if (cached == null || cached.isDirty(checkTasksSchedulerEventConfig.get().getCacheOptions().getValidPeriodInSeconds())) {
            List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
            command.add(ContainerServicesProperties.ManageTopicModels.LIST_TOPICS_CMD);
            command.add(name);

            String response = this.dockerExecutionService.execCommand(CommandType.TOPIC_GET, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));
            response = response.replace("INFO:TMmodel:-- -- -- Topic model object (TMmodel) successfully created", "");

            ArrayList<TopicEntity> topics = mapper.readValue(response, new TypeReference<>() {
            });
            if (topics == null) return data;
            for (int i = 0; i < topics.size(); i++) {
                topics.get(i).setId(i);
            }
            data.addAll(topics);
            TopicCachedEntity toCache = new TopicCachedEntity();
            toCache.setPayload(data);
            cacheLibrary.update(toCache, TopicCachedEntity.CODE + name);
        } else {
            data.addAll(cached.getPayload());
        }

        return new ArrayList<>(applyTopicLookup(data, lookup));
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
        TopicSimilarity similarity = mapper.readValue(response, new TypeReference<>() {
        });

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
        cacheLibrary.setDirtyByKey(TopicCachedEntity.CODE + name);
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
        cacheLibrary.setDirtyByKey(TopicCachedEntity.CODE + name);
    }

    @Override
    public void sortTopics(String name) throws IOException, ApiException, InterruptedException {
        List<String> command = new ArrayList<>(ContainerServicesProperties.ManageTopicModels.MANAGER_ENTRY_CMD);
        command.add(ContainerServicesProperties.ManageTopicModels.SORT_TOPICS_CMD);
        command.add(name);

        String result = this.dockerExecutionService.execCommand(CommandType.TOPIC_SORT, command, this.dockerExecutionService.ensureAvailableService(DockerService.MANAGE_MODELS));

        checkResult(result);
        cacheLibrary.setDirtyByKey(TopicCachedEntity.CODE + name);
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
        cacheLibrary.setDirtyByKey(TopicCachedEntity.CODE + name);
    }
}
