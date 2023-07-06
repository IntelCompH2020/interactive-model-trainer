package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.DomainModelCachedEntity;
import gr.cite.intelcomp.interactivemodeltrainer.cache.TopicModelCachedEntity;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.JobStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventPublishData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.EventProcessingStatus;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks.config.CheckTasksSchedulerEventConfig;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining.PrepareHierarchicalTrainingEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskResponse;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskSubType;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.query.ScheduledEventQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.TrainingTaskRequestQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersService;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.TRAIN_DOMAIN_MODELS_SERVICE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.TRAIN_TOPIC_MODELS_SERVICE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class CheckTasksScheduledEventHandlerImpl implements CheckTasksScheduledEventHandler {
    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(CheckTasksScheduledEventHandlerImpl.class));
    protected final ApplicationContext applicationContext;
    private final CheckTasksSchedulerEventConfig config;
    private final JsonHandlingService jsonHandlingService;
    private final TrainingTaskRequestService trainingTaskRequestService;
    private final DomainClassificationParametersService domainClassificationParametersService;
    private final CacheLibrary cacheLibrary;

    public CheckTasksScheduledEventHandlerImpl(
            ApplicationContext applicationContext,
            CheckTasksSchedulerEventConfig config,
            JsonHandlingService jsonHandlingService,
            TrainingTaskRequestService trainingTaskRequestService, DomainClassificationParametersService domainClassificationParametersService, CacheLibrary cacheLibrary) {
        this.applicationContext = applicationContext;
        this.config = config;
        this.jsonHandlingService = jsonHandlingService;
        this.trainingTaskRequestService = trainingTaskRequestService;
        this.domainClassificationParametersService = domainClassificationParametersService;
        this.cacheLibrary = cacheLibrary;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        CheckTasksScheduledEventData eventData = this.jsonHandlingService.fromJsonSafe(CheckTasksScheduledEventData.class, scheduledEvent.getData());
        if (eventData == null) {
            createNewEvent(scheduledEvent, entityManager);
            return EventProcessingStatus.Success;
        }

        EventProcessingStatus status;

        try {
            removeEvent(eventData.getPreviousCheckingEvent(), entityManager);

            logger.trace("Checking and updating running tasks");
            TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
            List<TrainingTaskRequestEntity> runningTrainRequests = trainingTaskRequestQuery
                    .status(TrainingTaskRequestStatus.PENDING)
                    .collect();
            logger.trace("Currently running tasks count -> {}", runningTrainRequests.size());

            CheckTasksConsistencyHandler checkTasksConsistencyHandler = applicationContext.getBean(CheckTasksConsistencyHandler.class);
            Boolean isConsistent = (checkTasksConsistencyHandler.isConsistent(new CheckTasksConsistencyPredicates()));
            if (isConsistent) {
                for (TrainingTaskRequestEntity request : runningTrainRequests) {
                    try {
                        this.run(request, entityManager);
                    } catch (Exception e) {
                        this.omit(request, entityManager, e);
                    }
                }
                removeOldCache();
                status = EventProcessingStatus.Success;
            } else {
                status = EventProcessingStatus.Postponed;
            }
            createNewEvent(scheduledEvent, entityManager);

            entityManager.flush();

        } catch (Exception ex) {
            logger.error("Problem getting scheduled event. Skipping: {}", ex.getMessage(), ex);
            status = EventProcessingStatus.Error;
        }

        return status;
    }

    private void removeEvent(UUID event, EntityManager entityManager) {
        logger.trace("Removing previously run check event from the database");
        ScheduledEventManageService scheduledEventManageService = applicationContext.getBean(ScheduledEventManageService.class);
        if (event != null) scheduledEventManageService.deleteAsync(event, entityManager);
    }

    private void createNewEvent(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        logger.trace("Generating new check event for running tasks");
        ScheduledEventQuery scheduledEventQuery = applicationContext.getBean(ScheduledEventQuery.class);
        if (scheduledEventQuery
                .eventTypes(ScheduledEventType.CHECK_RUNNING_TASKS)
                .status(ScheduledEventStatus.PENDING)
                .count() > 0) return;
        CheckTasksScheduledEventData data = new CheckTasksScheduledEventData(scheduledEvent.getId());
        ScheduledEventPublishData publishData = new ScheduledEventPublishData();
        publishData.setData(jsonHandlingService.toJsonSafe(data));
        publishData.setCreatorId(scheduledEvent.getCreatorId());
        publishData.setType(scheduledEvent.getEventType());
        publishData.setRunAt(Instant.now().plusSeconds(config.get().getCheckIntervalInSeconds()));
        publishData.setKey(scheduledEvent.getKey());
        publishData.setKeyType(scheduledEvent.getKeyType());
        ScheduledEventManageService scheduledEventManageService = applicationContext.getBean(ScheduledEventManageService.class);
        scheduledEventManageService.publishAsync(publishData, entityManager);
    }

    private void run(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager) throws Exception {
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        JobStatus jobStatus = containerManagementService.getJobStatus(trainingTaskRequest.getJobId());
        if (jobStatus == JobStatus.RUNNING) return;
        if (jobStatus == JobStatus.FINISHED) {
            trainingTaskRequest.setStatus(TrainingTaskRequestStatus.COMPLETED);
            if (trainingTaskRequest.getConfig().split(",").length >= 2) {
                ScheduledEventEntity relatedEvent = applicationContext.getBean(ScheduledEventQuery.class)
                        .eventTypes(ScheduledEventType.PREPARE_HIERARCHICAL_TOPIC_TRAINING)
                        .keys(trainingTaskRequest.getId().toString()).first();
                if (relatedEvent == null) {
                    logger.error("No scheduled event found related with the hierarchical training preparation request '{}'", trainingTaskRequest.getId());
                    trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
                } else {
                    try {
                        PrepareHierarchicalTrainingEventData eventData = jsonHandlingService.fromJson(PrepareHierarchicalTrainingEventData.class, relatedEvent.getData());
                        TrainingTaskRequest newTask = trainingTaskRequestService.persistTopicTrainingTaskForHierarchicalModel(eventData.getRequest(), trainingTaskRequest.getJobId(), eventData.getUserId(), entityManager);
                        trainingTaskRequest.setConfig(newTask.getId().toString());
                    } catch (JsonProcessingException e) {
                        logger.error("Could not deserialize event data to '{}' object", PrepareHierarchicalTrainingEventData.class.getSimpleName());
                        logger.error(e.getLocalizedMessage(), e);
                        trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
                    }
                }
            } else {
                updateCache(UUID.fromString(trainingTaskRequest.getJobId()));
                if (TRAIN_TOPIC_MODELS_SERVICE_NAME.equals(trainingTaskRequest.getJobName())) {
                    cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
                } else if (TRAIN_DOMAIN_MODELS_SERVICE_NAME.equals(trainingTaskRequest.getJobName())) {
                    cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
                } else {
                    //Invalidating cache for topic listings
                    cacheLibrary.setDirtyByKey(trainingTaskRequest.getConfig());
                }
            }
            containerManagementService.deleteJob(trainingTaskRequest.getJobId());
            entityManager.merge(trainingTaskRequest);
            entityManager.flush();
        } else if (jobStatus == JobStatus.FAILED || jobStatus == JobStatus.ERROR || jobStatus == JobStatus.KILLED) {
            trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
            containerManagementService.deleteJob(trainingTaskRequest.getJobId());
            entityManager.merge(trainingTaskRequest);
            entityManager.flush();

            updateCache(UUID.fromString(trainingTaskRequest.getJobId()));
            if (TRAIN_TOPIC_MODELS_SERVICE_NAME.equals(trainingTaskRequest.getJobName())) {
                cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
            } else if (TRAIN_DOMAIN_MODELS_SERVICE_NAME.equals(trainingTaskRequest.getJobName())) {
                cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
            }
        }
    }

    private void omit(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager, Exception e) {
        trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
        entityManager.merge(trainingTaskRequest);
        entityManager.flush();
        updateCache(UUID.fromString(trainingTaskRequest.getJobId()));
        logger.error(e.getMessage(), e);
    }

    private void updateCache(UUID task) {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache == null || cache.getPayload() == null) return;
        RunningTaskQueueItem item = cache.getPayload().stream().filter(i -> i.getTask().equals(task)).collect(Collectors.toList()).get(0);
        if (item == null) return;

        item.setFinished(true);
        item.setFinishedAt(Instant.now());

        String modelName = item.getLabel();
        if (modelName == null) {
            logger.error("Cannot extract label from running task object. Updating cache failed.");
            return;
        }
        if (RunningTaskSubType.RETRAIN_DOMAIN_MODEL.equals(item.getSubType())) {
            RunningTaskResponse response = new RunningTaskResponse();
            response.setLogs(domainClassificationParametersService.getLogs(modelName, DC_MODEL_RETRAIN_LOG_FILE_NAME));
            item.setResponse(response);
        } else if (RunningTaskSubType.CLASSIFY_DOMAIN_MODEL.equals(item.getSubType())) {
            RunningTaskResponse response = new RunningTaskResponse();
            response.setLogs(domainClassificationParametersService.getLogs(modelName, DC_MODEL_CLASSIFY_LOG_FILE_NAME));
            item.setResponse(response);
        } else if (RunningTaskSubType.EVALUATE_DOMAIN_MODEL.equals(item.getSubType())) {
            RunningTaskResponse response = new RunningTaskResponse();
            response.setLogs(domainClassificationParametersService.getLogs(modelName, DC_MODEL_EVALUATE_LOG_FILE_NAME));
            response.setPuScores(domainClassificationParametersService.getPU_scores(modelName));
            item.setResponse(response);
        } else if (RunningTaskSubType.SAMPLE_DOMAIN_MODEL.equals(item.getSubType())) {
            RunningTaskResponse response = new RunningTaskResponse();
            response.setLogs(domainClassificationParametersService.getLogs(modelName, DC_MODEL_SAMPLE_LOG_FILE_NAME));
            response.setDocuments(domainClassificationParametersService.getSampledDocuments(modelName));
            item.setResponse(response);
        } else if (RunningTaskSubType.GIVE_FEEDBACK_DOMAIN_MODEL.equals(item.getSubType())) {
            RunningTaskResponse response = new RunningTaskResponse();
            response.setLogs(domainClassificationParametersService.getLogs(modelName, DC_MODEL_FEEDBACK_LOG_FILE_NAME));
            item.setResponse(response);
        }
    }

    private void removeOldCache() {
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && cache.getPayload() != null) {
            List<RunningTaskQueueItem> finishedItems = cache.getPayload().stream().filter(i -> i.isFinished() && i.getType().equals(RunningTaskType.curating)).collect(Collectors.toList());
            for (RunningTaskQueueItem item : finishedItems) {
                if (item.getFinishedAt().isBefore(Instant.now().minus(config.get().getCacheOptions().getTaskResponseCacheRetentionInHours(), ChronoUnit.HOURS))) cache.getPayload().remove(item);
            }
        }
    }
}
