package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.audit.AuditableAction;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.EventProcessingStatus;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining.PrepareHierarchicalTrainingEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.resetmodel.ResetModelScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.config.RunTrainingSchedulerEventConfig;
import gr.cite.intelcomp.interactivemodeltrainer.query.TrainingTaskRequestQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.EventSchedulerUtils;
import gr.cite.tools.auditing.AuditService;
import gr.cite.tools.data.query.QueryFactory;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.jetbrains.annotations.NotNull;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.time.Instant;
import java.util.AbstractMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunTrainingScheduledEventHandlerImpl implements RunTrainingScheduledEventHandler {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunTrainingScheduledEventHandlerImpl.class));
    private final JsonHandlingService jsonHandlingService;
    private final ApplicationContext applicationContext;
    private final RunTrainingSchedulerEventConfig config;

    @Autowired
    public RunTrainingScheduledEventHandlerImpl(JsonHandlingService jsonHandlingService, ApplicationContext applicationContext, ContainerManagementService containerManagementService, RunTrainingSchedulerEventConfig config, ScheduledEventManageService scheduledEventManageService, QueryFactory queryFactory) {
        this.jsonHandlingService = jsonHandlingService;
        this.applicationContext = applicationContext;
        this.config = config;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws JsonProcessingException {
        EventSchedulerUtils.initializeRunningTasksCheckEvent(applicationContext);
        if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_ROOT_TRAINING) ||
                scheduledEvent.getEventType().equals(ScheduledEventType.PREPARE_HIERARCHICAL_TRAINING) ||
                scheduledEvent.getEventType().equals(ScheduledEventType.RUN_HIERARCHICAL_TRAINING))
            return handleTraining(scheduledEvent, entityManager);
        else if (scheduledEvent.getEventType().equals(ScheduledEventType.RESET_MODEL))
            return handleReset(scheduledEvent, entityManager);
        else return EventProcessingStatus.Error;
    }

    private EventProcessingStatus handleTraining(@NotNull ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        UUID trainingTaskRequestId = extractRequestIdFromEventData(scheduledEvent);
        if (trainingTaskRequestId == null) return EventProcessingStatus.Error;
        EventProcessingStatus status = null;

        try {
            RunTrainingConsistencyHandler runTrainingConsistencyHandler = applicationContext.getBean(RunTrainingConsistencyHandler.class);
            Boolean isConsistent = runTrainingConsistencyHandler.isConsistent(new RunTrainingConsistencyPredicates(trainingTaskRequestId));
            if (isConsistent) {
                TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
                Long runningTasks = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.PENDING)
                        .jobName("trainModels", "trainDomainModels")
                        .count();
                if (runningTasks >= config.get().getParallelTrainingsThreshold()) {
                    logger.debug("Currently running tasks have reached the limit ({}), postponing train task to run again in {} seconds...", config.get().getParallelTrainingsThreshold(), config.get().getPostponePeriodInSeconds());
                    scheduledEvent.setRunAt(Instant.now().plusSeconds(config.get().getPostponePeriodInSeconds()));
                    status = EventProcessingStatus.Postponed;
                }

                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName("trainModels")
                        .ids(trainingTaskRequestId).first();
                try {
                    if (!EventProcessingStatus.Postponed.equals(status)) {
                        if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_ROOT_TRAINING))
                            runRootTraining(trainingTaskRequest, entityManager);
                        else if (scheduledEvent.getEventType().equals(ScheduledEventType.PREPARE_HIERARCHICAL_TRAINING))
                            prepareHierarchicalTraining(trainingTaskRequest, entityManager);
                        else if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_HIERARCHICAL_TRAINING))
                            runHierarchicalTraining(trainingTaskRequest, entityManager);
                        status = EventProcessingStatus.Success;

                        AuditService auditService = applicationContext.getBean(AuditService.class);

                        auditService.track(AuditableAction.Scheduled_Event_Run, Map.ofEntries(
                                new AbstractMap.SimpleEntry<String, Object>("id", scheduledEvent.getId()),
                                new AbstractMap.SimpleEntry<String, Object>("eventType", scheduledEvent.getEventType()),
                                new AbstractMap.SimpleEntry<String, Object>("key", scheduledEvent.getKey()),
                                new AbstractMap.SimpleEntry<String, Object>("keyType", scheduledEvent.getKeyType()),
                                new AbstractMap.SimpleEntry<String, Object>("runAt", scheduledEvent.getRunAt())

                        ));
                    }
                    //auditService.trackIdentity(AuditableAction.IdentityTracking_Action);
                } catch (Exception e) {
                    status = EventProcessingStatus.Error;
                    logger.error(e.getLocalizedMessage());
                }
            } else {
                status = EventProcessingStatus.Error;
            }
        } catch (Exception ex) {
            logger.error("Problem getting scheduled event. Skipping: {}", ex.getMessage(), ex);
            status = EventProcessingStatus.Error;
        }
        return status;
    }

    private EventProcessingStatus handleReset(ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws JsonProcessingException {
        ResetModelScheduledEventData eventData = jsonHandlingService.fromJson(ResetModelScheduledEventData.class, scheduledEvent.getData());
        if (eventData == null) return EventProcessingStatus.Postponed;
        EventProcessingStatus status = null;

        try {
            RunTrainingConsistencyHandler runTrainingConsistencyHandler = applicationContext.getBean(RunTrainingConsistencyHandler.class);
            Boolean isConsistent = (runTrainingConsistencyHandler.isConsistent(new RunTrainingConsistencyPredicates(eventData.getRequestId())));
            if (isConsistent) {
                TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
                Long runningTasks = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.PENDING)
                        .jobName("resetModel")
                        .count();
                if (runningTasks >= config.get().getParallelTrainingsThreshold()) {
                    logger.debug("Currently running tasks have reached the limit ({}), postponing reset task to run again in {} seconds...", config.get().getParallelTrainingsThreshold(), config.get().getPostponePeriodInSeconds());
                    scheduledEvent.setRunAt(Instant.now().plusSeconds(config.get().getPostponePeriodInSeconds()));
                    status = EventProcessingStatus.Postponed;
                }

                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName("resetModel")
                        .ids(eventData.getRequestId()).first();
                try {
                    if (!EventProcessingStatus.Postponed.equals(status)) {
                        runModelReset(trainingTaskRequest, entityManager, eventData.getModelName());
                        status = EventProcessingStatus.Success;

                        AuditService auditService = applicationContext.getBean(AuditService.class);

                        auditService.track(AuditableAction.Scheduled_Event_Run, Map.ofEntries(
                                new AbstractMap.SimpleEntry<String, Object>("id", scheduledEvent.getId()),
                                new AbstractMap.SimpleEntry<String, Object>("eventType", scheduledEvent.getEventType()),
                                new AbstractMap.SimpleEntry<String, Object>("key", scheduledEvent.getKey()),
                                new AbstractMap.SimpleEntry<String, Object>("keyType", scheduledEvent.getKeyType()),
                                new AbstractMap.SimpleEntry<String, Object>("runAt", scheduledEvent.getRunAt())

                        ));
                    }
                    //auditService.trackIdentity(AuditableAction.IdentityTracking_Action);

                } catch (Exception e) {
                    status = EventProcessingStatus.Error;
                    logger.error(e.getLocalizedMessage());
                }
            } else {
                status = EventProcessingStatus.Error;
            }
        } catch (Exception ex) {
            logger.error("Problem getting scheduled event. Skipping: {}", ex.getMessage(), ex);
            status = EventProcessingStatus.Error;
        }
        return status;
    }

    private void runRootTraining(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager) throws IOException, ApiException {
        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put("COMMANDS", "topicmodeling.py --preproc --train --config " + trainingTaskRequest.getConfig());
        String logFile = trainingTaskRequest.getConfig().replace("trainconfig.json", "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running training task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void prepareHierarchicalTraining(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager) throws IOException, ApiException {
        String parentConfig = trainingTaskRequest.getConfig().split(",")[0];
        String config = trainingTaskRequest.getConfig().split(",")[1];

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put("COMMANDS", "topicmodeling.py --hierarchical --config " + parentConfig + " --config_child " + config);
        String logFile = config.replace("trainconfig.json", "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started preparing hierarchical training task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runHierarchicalTraining(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager) throws IOException, ApiException {
        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put("COMMANDS", "topicmodeling.py --train --config " + trainingTaskRequest.getConfig());
        String logFile = trainingTaskRequest.getConfig().replace("trainconfig.json", "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running hierarchical training task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runModelReset(TrainingTaskRequestEntity trainingTaskRequest, EntityManager entityManager, String modelName) throws IOException, ApiException {
        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put(
                "COMMANDS",
                String.join(
                        " ",
                        "manageModels.py",
                        ContainerServicesProperties.ManageTopicModels.PATH_TM_MODELS,
                        ContainerServicesProperties.ManageTopicModels.RESET_CMD,
                        modelName
                )
        );
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running reset task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private UUID extractRequestIdFromEventData(ScheduledEventEntity scheduledEvent) {
        try {
            RunTrainingScheduledEventData eventData = jsonHandlingService.fromJson(RunTrainingScheduledEventData.class, scheduledEvent.getData());
            return eventData.getTrainingTaskRequestId();
        } catch (JsonProcessingException e) {
            try {
                PrepareHierarchicalTrainingEventData eventData = jsonHandlingService.fromJson(PrepareHierarchicalTrainingEventData.class, scheduledEvent.getData());
                return eventData.getTrainingTaskRequestId();
            } catch (JsonProcessingException ex) {
                logger.error("Unable to extract training task request id from the event data...");
                logger.error(ex.getLocalizedMessage(), ex);
                return null;
            }
        }
    }

}
