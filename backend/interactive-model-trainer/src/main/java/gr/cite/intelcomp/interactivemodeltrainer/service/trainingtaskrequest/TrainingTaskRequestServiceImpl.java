package gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.cache.*;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventPublishData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining.PrepareHierarchicalTrainingEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.rundomaintraining.RunDomainTrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.RunTrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks.FuseModelScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks.TopicModelTaskScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainLabelsSelectionJsonModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskSubType;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicFusionPayload;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.CuratingTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersService;
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

import jakarta.persistence.EntityManager;

import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.*;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.*;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODELS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODEL_CONFIG_FILE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersServiceJson.DomainClassificationParametersModel;
import static gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersServiceJson.*;

@Service
public class TrainingTaskRequestServiceImpl implements TrainingTaskRequestService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TrainingTaskRequestServiceImpl.class));

    private final ScheduledEventManageService scheduledEventManageService;
    private final UserScope userScope;
    private final EntityManager entityManager;
    private final TopicModelingParametersService topicModelingParametersService;
    private final DomainClassificationParametersService domainClassificationParametersService;
    private final JsonHandlingService jsonHandlingService;
    private final CacheLibrary cacheLibrary;
    private final ContainerManagementService dockerExecutionService;
    private final ContainerServicesProperties containerServicesProperties;
    private final ObjectMapper objectMapper;

    @Autowired
    public TrainingTaskRequestServiceImpl(ScheduledEventManageService scheduledEventManageService, UserScope userScope, EntityManager entityManager, TopicModelingParametersService topicModelingParametersService, DomainClassificationParametersService domainClassificationParametersService, JsonHandlingService jsonHandlingService, CacheLibrary cacheLibrary, ContainerManagementService dockerExecutionService, ContainerServicesProperties containerServicesProperties, ObjectMapper objectMapper) {
        this.scheduledEventManageService = scheduledEventManageService;
        this.userScope = userScope;
        this.entityManager = entityManager;
        this.topicModelingParametersService = topicModelingParametersService;
        this.domainClassificationParametersService = domainClassificationParametersService;
        this.jsonHandlingService = jsonHandlingService;
        this.cacheLibrary = cacheLibrary;
        this.dockerExecutionService = dockerExecutionService;
        this.containerServicesProperties = containerServicesProperties;
        this.objectMapper = objectMapper;
    }

    private void updateTrainingCache(TopicModelingParametersModel model, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(model);
        item.setTask(task);
        item.setSubType(RunningTaskSubType.RUN_ROOT_TOPIC_TRAINING);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(model.getName());
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null)
                cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateTrainingCache(HierarchicalTopicModelingParametersModel model, String parentName, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        HierarchicalTopicModelingParametersEnhancedModel enhancedModel = objectMapper.convertValue(model, HierarchicalTopicModelingParametersEnhancedModel.class);
        enhancedModel.setParentName(parentName);

        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(enhancedModel);
        item.setTask(task);
        item.setSubType(RunningTaskSubType.RUN_HIERARCHICAL_TOPIC_TRAINING);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(model.getName());
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null)
                cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateTrainingCache(DomainClassificationParametersModel model, UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        TrainingTaskQueueItem item = new TrainingTaskQueueItem();
        item.setPayload(model);
        item.setTask(task);
        item.setSubType(RunningTaskSubType.RUN_ROOT_DOMAIN_TRAINING);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(String.join("::", model.getName(), model.getTag()));
        item.setFinished(false);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null)
                cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateCuratingCache(String modelName, UUID task, RunningTaskSubType taskType) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        CuratingTaskQueueItem item = new CuratingTaskQueueItem();
        item.setPayload(null);
        item.setTask(task);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(modelName);
        item.setFinished(false);
        item.setSubType(taskType);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null)
                cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    private void updateCuratingCache(DomainClassificationParametersModel model, UUID task, RunningTaskSubType taskType) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);

        CuratingTaskQueueItem item = new CuratingTaskQueueItem();
        item.setPayload(model);
        item.setTask(task);
        item.setUserId(userScope.getUserIdSafe());
        item.setLabel(String.join("::", model.getName(), model.getTag()));
        item.setFinished(false);
        item.setSubType(taskType);
        item.setStartedAt(Instant.now());
        if (cache != null) {
            if (cache.getPayload() == null)
                cache.setPayload(new ArrayList<>());
            cache.getPayload().add(item);
        } else {
            UserTasksCacheEntity newCache = new UserTasksCacheEntity();
            newCache.setPayload(new ArrayList<>());
            newCache.getPayload().add(item);
            cacheLibrary.update(newCache);
        }
    }

    @Override
    public TrainingTaskRequest persistTopicTrainingTaskForRootModel(TrainingTaskRequestPersist model) throws MyForbiddenException, MyValidationException, MyApplicationException, MyNotFoundException, InvalidApplicationException {
        Path configFile = topicModelingParametersService.generateRootConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RUN_ROOT_TOPIC_TRAINING);
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

        updateTrainingCache(topicModelingParametersService.getRootConfigurationModel(model.getName()), requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTopicPreparingTaskForHierarchicalModel(TrainingTaskRequestPersist model) throws InvalidApplicationException {
        Path configFile = topicModelingParametersService.generateHierarchicalConfigurationFile(model, userScope.getUserId());
        logger.debug("Training config file for hierarchical model '{}' generated -> {}", model.getName(), configFile.toString());

        UUID requestId = UUID.randomUUID();

        PrepareHierarchicalTrainingEventData eventData = new PrepareHierarchicalTrainingEventData(requestId, model, userScope.getUserId());

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.PREPARE_HIERARCHICAL_TOPIC_TRAINING);
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

        updateTrainingCache(topicModelingParametersService.getHierarchicalConfigurationFile(model.getParentName(), model.getName()), model.getParentName(), requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTopicTrainingTaskForHierarchicalModel(TrainingTaskRequestPersist model, String jobId, UUID userId, EntityManager entityManager) {
        UUID requestId = UUID.randomUUID();

        RunTrainingScheduledEventData eventData = new RunTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userId);
        publishData.setType(ScheduledEventType.RUN_HIERARCHICAL_TOPIC_TRAINING);
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
    public TrainingTaskRequest persistTopicModelResetTask(TrainingTaskRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        TopicModelTaskScheduledEventData eventData = new TopicModelTaskScheduledEventData(requestId, model.getName());

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RESET_TOPIC_MODEL);
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

        updateCuratingCache(model.getName(), requestId, RunningTaskSubType.RESET_TOPIC_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTopicModelFusionTask(String name, TopicFusionPayload payload) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        FuseModelScheduledEventData eventData = new FuseModelScheduledEventData(requestId, name, payload.getTopics());

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.FUSE_TOPIC_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(TopicCachedEntity.CODE + name);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TOPIC_MODEL_TASKS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateCuratingCache(name, requestId, RunningTaskSubType.FUSE_TOPIC_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistTopicModelSortTask(String name) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        TopicModelTaskScheduledEventData eventData = new TopicModelTaskScheduledEventData(requestId, name);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.SORT_TOPIC_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(TopicCachedEntity.CODE + name);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TOPIC_MODEL_TASKS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateCuratingCache(name, requestId, RunningTaskSubType.SORT_TOPIC_MODEL);
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
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        updateTrainingCache(domainClassificationParametersService.getConfigurationModel(model.getName()), requestId);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainRetrainingTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        DomainClassificationParametersModel parametersModel = domainClassificationParametersService.getConfigurationModel(model.getName());
        model.setTag(parametersModel.getTag());
        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.RETRAIN_DOMAIN_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        domainClassificationParametersService.prepareLogFile(model.getName(), DC_MODEL_RETRAIN_LOG_FILE_NAME);
        updateCuratingCache(parametersModel, requestId, RunningTaskSubType.RETRAIN_DOMAIN_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainClassifyTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        DomainClassificationParametersModel parametersModel = domainClassificationParametersService.getConfigurationModel(model.getName());
        model.setTag(parametersModel.getTag());
        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.CLASSIFY_DOMAIN_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        domainClassificationParametersService.prepareLogFile(model.getName(), DC_MODEL_CLASSIFY_LOG_FILE_NAME);
        updateCuratingCache(parametersModel, requestId, RunningTaskSubType.CLASSIFY_DOMAIN_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainEvaluateTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        DomainClassificationParametersModel parametersModel = domainClassificationParametersService.getConfigurationModel(model.getName());
        model.setTag(parametersModel.getTag());
        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.EVALUATE_DOMAIN_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        domainClassificationParametersService.prepareLogFile(model.getName(), DC_MODEL_EVALUATE_LOG_FILE_NAME);
        updateCuratingCache(parametersModel, requestId, RunningTaskSubType.EVALUATE_DOMAIN_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainSampleTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        DomainClassificationParametersModel parametersModel = domainClassificationParametersService.getConfigurationModel(model.getName());
        model.setTag(parametersModel.getTag());
        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.SAMPLE_DOMAIN_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        domainClassificationParametersService.prepareLogFile(model.getName(), DC_MODEL_SAMPLE_LOG_FILE_NAME);
        updateCuratingCache(parametersModel, requestId, RunningTaskSubType.SAMPLE_DOMAIN_MODEL);
        return result;
    }

    @Override
    public TrainingTaskRequest persistDomainFeedbackTaskForRootModel(DomainClassificationRequestPersist model, DomainLabelsSelectionJsonModel labels) throws InvalidApplicationException {
        UUID requestId = UUID.randomUUID();

        DomainClassificationParametersModel parametersModel = domainClassificationParametersService.getConfigurationModel(model.getName());
        model.setTag(parametersModel.getTag());
        RunDomainTrainingScheduledEventData eventData = new RunDomainTrainingScheduledEventData(requestId, model);

        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(eventData));
        publishData.setCreatorId(userScope.getUserId());
        publishData.setType(ScheduledEventType.GIVE_FEEDBACK_DOMAIN_MODEL);
        publishData.setRunAt(Instant.now());
        publishData.setKey(requestId.toString());
        publishData.setKeyType(TrainingTaskRequest._id);
        scheduledEventManageService.publishAsync(publishData);

        TrainingTaskRequestEntity entity = new TrainingTaskRequestEntity();
        entity.setId(requestId);
        entity.setStatus(TrainingTaskRequestStatus.NEW);
        entity.setIsActive(IsActive.ACTIVE);
        entity.setConfig(containerServicesProperties.getDomainTrainingService().getModelsInnerFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + model.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        entity.setCreatorId(userScope.getUserId());
        entity.setJobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME);
        entity.setJobId(requestId.toString());
        entity.setCreatedAt(Instant.now());
        entityManager.persist(entity);
        entityManager.flush();

        TrainingTaskRequest result = new TrainingTaskRequest();
        result.setId(requestId);

        domainClassificationParametersService.prepareLogFile(model.getName(), DC_MODEL_FEEDBACK_LOG_FILE_NAME);
        domainClassificationParametersService.generateLabelsFile(model.getName(), model.getTag(), labels);
        updateCuratingCache(parametersModel, requestId, RunningTaskSubType.GIVE_FEEDBACK_DOMAIN_MODEL);
        return result;
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
                    .filter(i -> i.isFinished() && i.getTask().equals(task) && i.getUserId().equals(userScope.getUserIdSafe()))
                    .findFirst()
                    .ifPresent(item -> cache.getPayload().remove(item));
        }
    }

    @Override
    public void cancelTask(UUID task) {
        logger.debug("There is a request for task cancellation with id {}", task);
        try {
            dockerExecutionService.deleteJob(task.toString());
        } catch (ApiException e) {
            logger.error("Could not cancel task. There is no container present with id {}", task);
        }
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            cache.getPayload().stream()
                    .filter(i -> i.getTask().equals(task) && i.getUserId().equals(userScope.getUserIdSafe()))
                    .findFirst()
                    .ifPresent(item -> {
                        if (RunningTaskType.training == item.getType()) {
                            cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
                            cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
                        }
                        cache.getPayload().remove(item);
                    });
            cacheLibrary.update(cache);
        }
    }

    @Override
    public void clearAllFinishedTasks(RunningTaskType type) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            cache.getPayload().stream()
                    .filter(i -> i.getType() == type && i.isFinished() && i.getUserId().equals(userScope.getUserIdSafe()))
                    .toList()
                    .forEach(item -> cache.getPayload().remove(item));
            cacheLibrary.update(cache);
        }
    }

    @Override
    public List<? extends RunningTaskQueueItem> getRunningTasks(RunningTaskType type) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        List<? extends RunningTaskQueueItem> items = new ArrayList<>();
        if (cache != null) {
            items = cache.getPayload();
        }
        if (type == RunningTaskType.curating) {
            return items
                    .stream()
                    .filter(item -> item.getType() == type)
                    .toList();
        } else {
            return items
                    .stream()
                    .filter(item -> userScope.isSet() && userScope.getUserIdSafe().equals(item.getUserId()) && item.getType() == type)
                    .toList();
        }
    }
}
