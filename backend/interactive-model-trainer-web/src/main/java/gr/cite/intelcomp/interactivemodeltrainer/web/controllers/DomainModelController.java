package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.DomainModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.model.DomainModelService;
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
import java.util.List;

@RestController
@RequestMapping(path = "api/domain-model", produces = MediaType.APPLICATION_JSON_VALUE)
public class DomainModelController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DomainModelController.class));

    private final DomainModelService domainModelService;
    private final TrainingTaskRequestService trainingTaskRequestService;
    private final ContainerServicesProperties containerServicesProperties;

    @Autowired
    public DomainModelController(DomainModelService domainModelService, TrainingTaskRequestService trainingTaskRequestService, ContainerServicesProperties containerServicesProperties) {
        this.domainModelService = domainModelService;
        this.trainingTaskRequestService = trainingTaskRequestService;
        this.containerServicesProperties = containerServicesProperties;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<DomainModel> GetAll(@RequestBody DomainModelLookup lookup) throws InterruptedException, IOException, ApiException {
        List<DomainModel> models = domainModelService.getAll(lookup);
        return new QueryResult<>(models, models.size());
    }

    @PostMapping("{name}/copy")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        domainModelService.copy(ModelType.DOMAIN, name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo model) throws InterruptedException, IOException, ApiException {
        domainModelService.rename(ModelType.DOMAIN, model.getOldName(), model.getNewName());
    }

    @DeleteMapping("{name}/delete")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        domainModelService.delete(ModelType.DOMAIN, name);
    }

    @PostMapping("train")
    @Transactional
    public TrainingTaskRequest trainDomainModel(@Valid @RequestBody DomainClassificationRequestPersist domainClassificationRequestPersist) throws InvalidApplicationException {
        return trainingTaskRequestService.persistDomainTrainingTaskForRootModel(domainClassificationRequestPersist);
    }

    @GetMapping("train/logs/{name}")
    @Transactional
    public List<String> getTrainingLogs(@PathVariable(name = "name") String modelName) throws IOException {
        return Files.readAllLines(Path.of(containerServicesProperties.getServices().get("domainTraining").getModelsFolder(ContainerServicesProperties.ManageDomainModels.class), modelName, "execution.log"));
    }

}
