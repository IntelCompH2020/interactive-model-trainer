package gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.cashe.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cashe.UserTasksCacheEntity;
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
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.rundomaintraining.RunDomainTrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.RunTrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersService;
import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersService;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.exception.MyForbiddenException;
import gr.cite.tools.exception.MyNotFoundException;
import gr.cite.tools.exception.MyValidationException;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.management.InvalidApplicationException;
import javax.persistence.EntityManager;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.*;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.DC_MODELS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODELS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODEL_CONFIG_FILE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersServiceJson.*;
import static gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersServiceJson.*;

@Service
public class TrainingTaskRequestServiceImpl implements TrainingTaskRequestService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TrainingTaskRequestServiceImpl.class));

    private final ScheduledEventManageService scheduledEventManageService;
    private final UserScope userScope;
    private final EntityManager entityManager;
    private final TopicModelingParametersService topicModelingParametersService;
    private final DomainClassificationParametersService domainClassificationParametersService;
    private final JsonHandlingService jsonHandlingService;
    private final ApplicationContext applicationContext;
    private final CacheLibrary cacheLibrary;
    private final ObjectMapper objectMapper;

    @Autowired
    public TrainingTaskRequestServiceImpl(ScheduledEventManageService scheduledEventManageService, UserScope userScope, EntityManager entityManager, TopicModelingParametersService topicModelingParametersService, DomainClassificationParametersService domainClassificationParametersService, JsonHandlingService jsonHandlingService, ApplicationContext applicationContext, CacheLibrary cacheLibrary, ObjectMapper objectMapper) {
        this.scheduledEventManageService = scheduledEventManageService;
        this.userScope = userScope;
        this.entityManager = entityManager;
        this.topicModelingParametersService = topicModelingParametersService;
        this.domainClassificationParametersService = domainClassificationParametersService;
        this.jsonHandlingService = jsonHandlingService;
        this.applicationContext = applicationContext;
        this.cacheLibrary = cacheLibrary;
        this.objectMapper = objectMapper;
    }

    private void updateCache(TopicModelingParametersModel model, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(model);
        item.setTask(task);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(model.getName());
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null) cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateCache(HierarchicalTopicModelingParametersModel model, String parentName, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        HierarchicalTopicModelingParametersEnhancedModel enhancedModel = objectMapper.convertValue(model, HierarchicalTopicModelingParametersEnhancedModel.class);
        enhancedModel.setParentName(parentName);

        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(enhancedModel);
        item.setTask(task);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(model.getName());
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null) cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateCache(DomainClassificationParametersModel model, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(model);
        item.setTask(task);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(model.getName());
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null) cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    @Override
    public TrainingTaskRequest persistTrainingTaskForRootModel(TrainingTaskRequestPersist model) throws MyForbiddenException, MyValidationException, MyApplicationException, MyNotFoundException, InvalidApplicationException {
        Path configFile = topicModelingParametersService.generateRootConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model);

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
        entity.setConfig(TM_MODELS_ROOT + model.getName() + "/" + configFile.getFileName().toString());
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_TOPIC_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateCache(topicModelingParametersService.getRootConfigurationModel(model.getName()), requestId);
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
        String parentConfig = TM_MODELS_ROOT + model.getParentName() + "/" + TM_MODEL_CONFIG_FILE_NAME;
        String config = TM_MODELS_ROOT + model.getParentName() + "/" + model.getName() + "/" + TM_MODEL_CONFIG_FILE_NAME;
        entity.setConfig(String.join(",", parentConfig, config));
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_TOPIC_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateCache(topicModelingParametersService.getHierarchicalConfigurationFile(model.getParentName(), model.getName()), model.getParentName() , requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTrainingTaskForHierarchicalModel(TrainingTaskRequestPersist model, String jobId, UUID userId, EntityManager entityManager) {
        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model);

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
        String config = TM_MODELS_ROOT + model.getParentName() + "/" + model.getName() + "/" + TM_MODEL_CONFIG_FILE_NAME;
        entity.setConfig(config);
        entity.setCreatorId(userId);
        entity.setJobName(TRAIN_TOPIC_MODELS_SERVICE_NAME);
        entity.setJobId(jobId);
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
        entity.setJobName(TOPIC_MODEL_TASKS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainTrainingTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException {
        Path configFile = domainClassificationParametersService.generateConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RUN_ROOT_DOMAIN_TRAINING);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(DC_MODELS_ROOT + model.getName() + "/" + configFile.getFileName().toString());
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateCache(domainClassificationParametersService.getConfigurationModel(model.getName()), requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainRetrainingTaskForRootModel(DomainClassificationRequestPersist model) {
        return null;
    }

    @Override
    public TrainingTaskRequest persistDomainClassifyTaskForRootModel(String name) {
        return null;
    }

    @Override
    public TrainingTaskRequest persistDomainEvaluateTaskForRootModel(DomainClassificationRequestPersist model) {
        return null;
    }

    @Override
    public TrainingTaskRequest persistDomainSampleTaskForRootModel(DomainClassificationRequestPersist model) {
        return null;
    }

    @Override
    public TrainingTaskRequestStatus getTaskStatus(UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            Optional<RunningTaskQueueItem> found = cache.getPayload().stream()
                    .filter(i -> i.getTask().equals(task) && i.getUserId().equals(userScope.getUserIdSafe()))
                    .findFirst();
            return found
                    .map(trainingQueueItem -> trainingQueueItem.isFinished() ? TrainingTaskRequestStatus.COMPLETED : TrainingTaskRequestStatus.PENDING)
                    .orElse(TrainingTaskRequestStatus.ERROR);
        } else {
            return TrainingTaskRequestStatus.ERROR;
        }
    }

    @Override
    public void clearFinishedTask(UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            cache.getPayload().stream()
                    .filter(i -> RunningTaskType.training.equals(i.getType()) && i.isFinished() && i.getTask().equals(task) && i.getUserId().equals(userScope.getUserIdSafe()))
                    .findFirst()
                    .ifPresent(item -> cache.getPayload().remove(item));
        }
    }

    @Override
    public void clearAllFinishedTasks(RunningTaskType type) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            cache.getPayload().stream()
                    .filter(i -> i.getType().equals(type) && i.isFinished() && i.getUserId().equals(userScope.getUserIdSafe()) )
                    .collect(Collectors.toList())
                    .forEach(item -> cache.getPayload().remove(item));
        }
    }

    @Override
    public List<? extends RunningTaskQueueItem> getRunningTasks(RunningTaskType type) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        List<? extends RunningTaskQueueItem> items = new ArrayList<>();
        if (cache != null) {
            items = cache.getPayload();
        }
        return items.stream()
                .filter(item -> item.getUserId().equals(userScope.getUserIdSafe()) && item.getType().equals(type))
                .collect(Collectors.toList());
    }
}
