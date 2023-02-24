package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.intelcomp.interactivemodeltrainer.query.ScheduledEventQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.TrainingTaskRequestQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class CheckTasksScheduledEventHandlerImpl implements CheckTasksScheduledEventHandler {
    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(CheckTasksScheduledEventHandlerImpl.class));
    protected final ApplicationContext applicationContext;
    private final CheckTasksSchedulerEventConfig config;
    private final JsonHandlingService jsonHandlingService;
    private final TrainingTaskRequestService trainingTaskRequestService;

    public CheckTasksScheduledEventHandlerImpl(
            ApplicationContext applicationContext,
            CheckTasksSchedulerEventConfig config,
            JsonHandlingService jsonHandlingService,
            TrainingTaskRequestService trainingTaskRequestService) {
        this.applicationContext = applicationContext;
        this.config = config;
        this.jsonHandlingService = jsonHandlingService;
        this.trainingTaskRequestService = trainingTaskRequestService;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        CheckTasksScheduledEventData eventData = this.jsonHandlingService.fromJsonSafe(CheckTasksScheduledEventData.class, scheduledEvent.getData());
        if (eventData == null) return EventProcessingStatus.Success;

        EventProcessingStatus status;

        try {
            removeEvent(eventData.getPreviousCheckingEvent(), entityManager);

            logger.info("Checking and updating running training tasks");
            TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
            List<TrainingTaskRequestEntity> runningTrainRequests = trainingTaskRequestQuery
                    .status(TrainingTaskRequestStatus.PENDING)
                    .jobName("trainModels")
                    .collect();
            logger.debug("Currently running training tasks count -> {}", runningTrainRequests.size());

            logger.info("Checking and updating running reset model tasks");
            TrainingTaskRequestQuery modelResetTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
            List<TrainingTaskRequestEntity> runningResetRequests = modelResetTaskRequestQuery
                    .status(TrainingTaskRequestStatus.PENDING)
                    .jobName("resetModel")
                    .collect();
            logger.debug("Currently running reset model tasks count -> {}", runningResetRequests.size());

            CheckTasksConsistencyHandler checkTasksConsistencyHandler = applicationContext.getBean(CheckTasksConsistencyHandler.class);
            Boolean isConsistent = (checkTasksConsistencyHandler.isConsistent(new CheckTasksConsistencyPredicates()));
            if (isConsistent) {
                try {
                    for (TrainingTaskRequestEntity request : runningTrainRequests) {
                        this.run(request, entityManager);
                    }
                    for (TrainingTaskRequestEntity request : runningResetRequests) {
                        this.run(request, entityManager);
                    }
                    status = EventProcessingStatus.Success;

                } catch (Exception e) {
                    status = EventProcessingStatus.Error;
                    logger.error(e);
                }
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
        logger.debug("Removing previously run check event from the database");
        ScheduledEventManageService scheduledEventManageService = applicationContext.getBean(ScheduledEventManageService.class);
        if (event != null) scheduledEventManageService.deleteAsync(event, entityManager);
    }

    private void createNewEvent(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        logger.debug("Generating new check event for running tasks");
        ScheduledEventQuery scheduledEventQuery = applicationContext.getBean(ScheduledEventQuery.class);
        if (scheduledEventQuery.status(ScheduledEventStatus.PENDING).count() > 0) return;
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
                        .eventTypes(ScheduledEventType.PREPARE_HIERARCHICAL_TRAINING)
                        .keys(trainingTaskRequest.getId().toString()).first();
                if (relatedEvent == null) {
                    logger.error("No scheduled event found related with the hierarchical training preparation request '{}'", trainingTaskRequest.getId());
                    trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
                } else {
                    try {
                        PrepareHierarchicalTrainingEventData eventData = jsonHandlingService.fromJson(PrepareHierarchicalTrainingEventData.class, relatedEvent.getData());
                        TrainingTaskRequest newTask = trainingTaskRequestService.persistTrainingTaskForHierarchicalModel(eventData.getRequest(), eventData.getUserId(), entityManager);
                        trainingTaskRequest.setConfig(newTask.getId().toString());
                    } catch (JsonProcessingException e) {
                        logger.error("Could not deserialize event data to '{}' object", PrepareHierarchicalTrainingEventData.class.getSimpleName());
                        logger.error(e.getLocalizedMessage(), e);
                        trainingTaskRequest.setStatus(TrainingTaskRequestStatus.ERROR);
                    }
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
        }
    }
}
