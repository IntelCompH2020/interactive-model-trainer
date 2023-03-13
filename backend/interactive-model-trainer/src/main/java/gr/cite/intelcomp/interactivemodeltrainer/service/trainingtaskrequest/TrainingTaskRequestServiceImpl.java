package gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest;

import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventPublishData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining.PrepareHierarchicalTrainingEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.resetmodel.ResetModelScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.RunTrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersService;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.exception.MyForbiddenException;
import gr.cite.tools.exception.MyNotFoundException;
import gr.cite.tools.exception.MyValidationException;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.management.InvalidApplicationException;
import javax.persistence.EntityManager;
import java.io.IOException;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.UUID;

@Service
public class TrainingTaskRequestServiceImpl implements TrainingTaskRequestService{

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TrainingTaskRequestServiceImpl.class));

    private final ScheduledEventManageService scheduledEventManageService;
    private final UserScope userScope;
    private final EntityManager entityManager;
    private final TopicModelingParametersService topicModelingParametersService;
    private final JsonHandlingService jsonHandlingService;

    @Autowired
    public TrainingTaskRequestServiceImpl(ScheduledEventManageService scheduledEventManageService, UserScope userScope, EntityManager entityManager, TopicModelingParametersService topicModelingParametersService, JsonHandlingService jsonHandlingService) {
        this.scheduledEventManageService = scheduledEventManageService;
        this.userScope = userScope;
        this.entityManager = entityManager;
        this.topicModelingParametersService = topicModelingParametersService;
        this.jsonHandlingService = jsonHandlingService;
    }

    @Override
    public TrainingTaskRequest persistTrainingTaskForRootModel(TrainingTaskRequestPersist model) throws MyForbiddenException, MyValidationException, MyApplicationException, MyNotFoundException, InvalidApplicationException, NoSuchAlgorithmException, IOException, ApiException {
        Path configFile = topicModelingParametersService.generateRootConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model.getCorpusId(), jsonHandlingService.toJsonSafe(model.getParameters()));

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RUN_ROOT_TRAINING);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig("/data/TMmodels/"+ model.getName() + "/" + configFile.getFileName().toString());
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName("trainModels");
        entity.setJobId(UUID.randomUUID().toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistPreparingTaskForHierarchicalModel(TrainingTaskRequestPersist model) throws InvalidApplicationException {
        Path configFile = topicModelingParametersService.generateHierarchicalConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for hierarchical model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        PrepareHierarchicalTrainingEventData eventData = new PrepareHierarchicalTrainingEventData(requestId, model, userScope.getUserId());

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.PREPARE_HIERARCHICAL_TRAINING);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        String parentConfig = "/data/TMmodels/"+ model.getParentName() + "/trainconfig.json";
        String config = "/data/TMmodels/"+ model.getParentName() + "/" + model.getName() + "/trainconfig.json";
        entity.setConfig(String.join(",", parentConfig, config));
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName("trainModels");
        entity.setJobId(UUID.randomUUID().toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTrainingTaskForHierarchicalModel(TrainingTaskRequestPersist model, UUID userId, EntityManager entityManager) {
        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model.getCorpusId(), jsonHandlingService.toJsonSafe(model.getParameters()));

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userId);
        publishData.setType(ScheduledEventType.RUN_HIERARCHICAL_TRAINING);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData, entityManager);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        String config = "/data/TMmodels/"+ model.getParentName() + "/" + model.getName() + "/trainconfig.json";
        entity.setConfig(config);
        entity.setCreatorId(userId);
        entity.setJobName("trainModels");
        entity.setJobId(UUID.randomUUID().toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistModelResetTask(TrainingTaskRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        ResetModelScheduledEventData eventData = new ResetModelScheduledEventData(requestId, model.getName());

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RESET_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig("");
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName("resetModel");
        entity.setJobId(UUID.randomUUID().toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);
        return result;
    }

    @Override
    public TrainingTaskRequestStatus getTaskStatus(UUID task) {
        TrainingTaskRequestEntity request = entityManager.find(TrainingTaskRequestEntity.class, task);
        if (request == null) return TrainingTaskRequestStatus.ERROR;
        else {
            try {
                UUID next = UUID.fromString(request.getConfig());
                TrainingTaskRequestEntity nextRequest = entityManager.find(TrainingTaskRequestEntity.class, next);
                if (nextRequest == null) {
                    logger.error("No preparing task request found for hierarchical training with id '{}'", task);
                    return TrainingTaskRequestStatus.ERROR;
                }
                else return nextRequest.getStatus();
            } catch (IllegalArgumentException e) {
                return request.getStatus();
            }
        }
    }
}
