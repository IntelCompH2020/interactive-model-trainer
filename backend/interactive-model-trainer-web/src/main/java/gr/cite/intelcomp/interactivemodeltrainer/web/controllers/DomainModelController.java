package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainLabelsSelectionJsonModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.DomainModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.model.DomainModelService;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.ModelPatchInfo;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.RenameInfo;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.management.InvalidApplicationException;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static gr.cite.intelcomp.interactivemodeltrainer.web.controllers.BaseController.extractQueryResultWithCount;

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
    public QueryResult<DomainModel> GetAll(@RequestBody DomainModelLookup lookup) {
        return extractQueryResultWithCount(l -> {
            try {
                return domainModelService.getAll(l);
            } catch (IOException | InterruptedException | ApiException e) {
                throw new RuntimeException(e);
            }
        }, lookup);
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

    @PatchMapping("{name}/patch")
    @Transactional
    public void Patch(@PathVariable("name") String name, @RequestBody ModelPatchInfo model) {
        domainModelService.patch(name, model.getDescription(), model.getTag(), model.getVisibility());
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
    public List<String> getTrainingLogs(@PathVariable(name = "name") String modelName, HttpServletResponse response) {
        try {
            List<String> lines = Files.readAllLines(Path.of(containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class), modelName, "execution.log"));
            if (lines.isEmpty()) lines.add("INFO: Logs empty. Nothing to display.");
            return lines;
        } catch (IOException e) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return List.of("ERROR: Logs not found.");
        }
    }

    @PostMapping("retrain")
    @Transactional
    public TrainingTaskRequest retrainDomainModel(@Valid @RequestBody DomainClassificationRequestPersist domainClassificationRequestPersist) throws InvalidApplicationException {
        return trainingTaskRequestService.persistDomainRetrainingTaskForRootModel(domainClassificationRequestPersist);
    }

    @GetMapping("{name}/classify")
    @Transactional
    public TrainingTaskRequest classifyDomainModel(@PathVariable(name = "name") String modelName) throws InvalidApplicationException {
        DomainClassificationRequestPersist model = new DomainClassificationRequestPersist();
        model.setName(modelName);
        return trainingTaskRequestService.persistDomainClassifyTaskForRootModel(model);
    }

    @PostMapping("evaluate")
    @Transactional
    public TrainingTaskRequest evaluateDomainModel(@Valid @RequestBody DomainClassificationRequestPersist domainClassificationRequestPersist) throws InvalidApplicationException {
        return trainingTaskRequestService.persistDomainEvaluateTaskForRootModel(domainClassificationRequestPersist);
    }

    @PostMapping("sample")
    @Transactional
    public TrainingTaskRequest sampleDomainModel(@Valid @RequestBody DomainClassificationRequestPersist domainClassificationRequestPersist) throws InvalidApplicationException {
        return trainingTaskRequestService.persistDomainSampleTaskForRootModel(domainClassificationRequestPersist);
    }

    @PostMapping("{name}/give-feedback")
    @Transactional
    public TrainingTaskRequest giveFeedbackDomainModel(@PathVariable(name = "name") String modelName, @Valid @RequestBody DomainLabelsSelectionJsonModel labels) throws InvalidApplicationException {
        DomainClassificationRequestPersist model = new DomainClassificationRequestPersist();
        model.setName(modelName);
        return trainingTaskRequestService.persistDomainFeedbackTaskForRootModel(model, labels);
    }

}
