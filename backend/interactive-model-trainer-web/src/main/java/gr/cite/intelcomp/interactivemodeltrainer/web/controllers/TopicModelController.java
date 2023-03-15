package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.TopicModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.*;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.TopicLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.TopicModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.model.TopicModelService;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.RenameInfo;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.management.InvalidApplicationException;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "api/topic-model", produces = MediaType.APPLICATION_JSON_VALUE)
public class TopicModelController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TopicModelController.class));

    private final TopicModelService topicModelService;
    private final TrainingTaskRequestService trainingTaskRequestService;
    private final ContainerServicesProperties containerServicesProperties;

    @Autowired
    public TopicModelController(TopicModelService domainModelService, TrainingTaskRequestService trainingTaskRequestService, ContainerServicesProperties containerServicesProperties) {
        this.topicModelService = domainModelService;
        this.trainingTaskRequestService = trainingTaskRequestService;
        this.containerServicesProperties = containerServicesProperties;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<TopicModel> GetAll(@RequestBody TopicModelLookup lookup) throws InterruptedException, IOException, ApiException {
        List<TopicModel> models = topicModelService.getAll(lookup);
        return new QueryResult<>(models, models.size());
    }

    @GetMapping("{name}")
    @Transactional
    public QueryResult<TopicModel> GetSingle(@PathVariable(name = "name") String name) throws InterruptedException, IOException, ApiException {
        List<TopicModel> models = topicModelService.getModel(name);
        return new QueryResult<>(models, models.size());
    }

    @PostMapping("{name}/copy")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        topicModelService.copy(ModelType.TOPIC, name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo model) throws InterruptedException, IOException, ApiException {
        topicModelService.rename(ModelType.TOPIC, model.getOldName(), model.getNewName());
    }

    @DeleteMapping("{name}/delete")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        topicModelService.delete(ModelType.TOPIC, name);
    }

    @GetMapping("{name}/reset")
    @Transactional
    public TrainingTaskRequest Reset(@PathVariable("name") String name) throws InvalidApplicationException {
        TrainingTaskRequestPersist task = new TrainingTaskRequestPersist();
        task.setName(name);
        return trainingTaskRequestService.persistModelResetTask(task);
    }

    @GetMapping(value = "{name}/ldavis.v3.0.0.js", produces = "text/javascript")
    @ResponseBody
    public String PyLDAvisLibrary(@PathVariable("name") String name) throws IOException {
        return topicModelService.getPyLDAvisLibrary(name);
    }

    @GetMapping(value = "/{name}/pyLDAvis.html", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String PyLDAvis(@PathVariable("name") String name) throws IOException {
        return topicModelService.getPyLDAvis(name);
    }

    @GetMapping(value = "/{name}/d3.js", produces = "text/javascript")
    @ResponseBody
    public String D3(@PathVariable("name") String name) throws IOException {
        return topicModelService.getD3(name);
    }

    @GetMapping(value = "{parentName}/{name}/ldavis.v3.0.0.js", produces = "text/javascript")
    @ResponseBody
    public String PyLDAvisLibraryHierarchical(@PathVariable("parentName") String parentName, @PathVariable("name") String name) throws IOException {
        return topicModelService.getPyLDAvisLibrary(parentName, name);
    }

    @GetMapping(value = "{parentName}/{name}/pyLDAvis.html", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String PyLDAvisHierarchical(@PathVariable("parentName") String parentName, @PathVariable("name") String name) throws IOException {
        return topicModelService.getPyLDAvis(parentName, name);
    }

    @GetMapping(value = "{parentName}/{name}/d3.js", produces = "text/javascript")
    @ResponseBody
    public String D3Hierarchical(@PathVariable("parentName") String parentName, @PathVariable("name") String name) throws IOException {
        return topicModelService.getD3(parentName, name);
    }

    @PostMapping("/{name}/topics/all")
    @Transactional
    public QueryResult<Topic> GetAllTopics(@PathVariable("name") String name, @RequestBody TopicLookup lookup) throws InterruptedException, IOException, ApiException {
        List<Topic> models = topicModelService.getAllTopics(name, lookup);
        lookup.setPage(null);
        int count = topicModelService.getAllTopics(name, lookup).size();
        return new QueryResult<>(models, count);
    }

    @PostMapping("/{name}/topics/labels")
    @Transactional
    public void SetTopicLabels(@PathVariable("name") String name, @Valid @RequestBody TopicLabelsPayload payload) throws IOException, InterruptedException, ApiException {
        topicModelService.setTopicLabels(name, payload.getLabels());
    }

    @PostMapping("/{name}/topics/similar")
    @Transactional
    public QueryResult<TopicSimilarity> GetSimilarTopics(@PathVariable("name") String name, @Valid @RequestBody TopicSimilarityPayload payload) throws InterruptedException, IOException, ApiException {
        return new QueryResult<>(List.of(topicModelService.getSimilarTopics(name, payload.getPairs())), 1);
    }

    @PostMapping("/{name}/topics/fuse")
    @Transactional
    public void fuseTopics(@PathVariable("name") String name, @Valid @RequestBody TopicFusionPayload payload) throws InterruptedException, IOException, ApiException {
        topicModelService.fuseTopics(name, payload.getTopics());
    }

    @GetMapping("/{name}/topics/sort")
    @Transactional
    public void sortTopics(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        topicModelService.sortTopics(name);
    }

    @PostMapping("/{name}/topics/delete")
    @Transactional
    public void deleteTopics(@PathVariable("name") String name, @RequestBody TopicDeletionPayload payload) throws InterruptedException, IOException, ApiException {
        topicModelService.deleteTopics(name, payload.getTopics());
    }

    @PostMapping("train")
    @Transactional
    public TrainingTaskRequest trainTopicModel(@Valid @RequestBody TrainingTaskRequestPersist trainingTaskRequestPersist) throws InvalidApplicationException, NoSuchAlgorithmException, IOException, ApiException {
        if (!trainingTaskRequestPersist.getHierarchical()) return trainingTaskRequestService.persistTrainingTaskForRootModel(trainingTaskRequestPersist);
        else return trainingTaskRequestService.persistPreparingTaskForHierarchicalModel(trainingTaskRequestPersist);
    }

    @GetMapping("train/logs/{name}")
    @Transactional
    public List<String> getTrainingLogs(@PathVariable(name = "name") String modelName) throws IOException {
        return Files.readAllLines(Path.of(containerServicesProperties.getServices().get("training").getModelsFolder(ContainerServicesProperties.ManageTopicModels.class), modelName, "execution.log"));
    }

    @GetMapping("train/logs/{parent}/{name}")
    @Transactional
    public List<String> getHierarchicalTrainingLogs(@PathVariable(name = "parent") String parentModelName, @PathVariable(name = "name") String modelName) throws IOException {
        return Files.readAllLines(Path.of(containerServicesProperties.getServices().get("training").getModelsFolder(ContainerServicesProperties.ManageTopicModels.class), parentModelName, modelName, "execution.log"));
    }

    @GetMapping("tasks/{task}/status")
    public TrainingTaskRequestStatus getTaskStatus(@PathVariable(name = "task") UUID task) {
        return trainingTaskRequestService.getTaskStatus(task);
    }



}
