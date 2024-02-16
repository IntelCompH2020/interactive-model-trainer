package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining;

import gr.cite.intelcomp.interactivemodeltrainer.audit.AuditableAction;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.utils.EventSchedulerUtils;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.EventProcessingStatus;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining.PrepareHierarchicalTrainingEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.config.RunTrainingSchedulerEventConfig;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks.FuseModelScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks.TopicModelTaskScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.query.TrainingTaskRequestQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.auditing.AuditService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import jakarta.persistence.EntityManager;
import org.jetbrains.annotations.NotNull;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.*;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageTopicModels.InnerPaths.TM_MODEL_CONFIG_FILE_NAME;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunTrainingScheduledEventHandlerImpl implements RunTrainingScheduledEventHandler {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunTrainingScheduledEventHandlerImpl.class));

    private final JsonHandlingService jsonHandlingService;

    private final ApplicationContext applicationContext;

    private final RunTrainingSchedulerEventConfig config;

    private final DockerService dockerService;

    @Autowired
    public RunTrainingScheduledEventHandlerImpl(JsonHandlingService jsonHandlingService, ApplicationContext applicationContext, RunTrainingSchedulerEventConfig config, DockerService dockerService) {
        this.jsonHandlingService = jsonHandlingService;
        this.applicationContext = applicationContext;
        this.config = config;
        this.dockerService = dockerService;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        EventSchedulerUtils.initializeRunningTasksCheckEvent(applicationContext);
        if (scheduledEvent.getEventType() == ScheduledEventType.RUN_ROOT_TOPIC_TRAINING ||
                scheduledEvent.getEventType() == ScheduledEventType.PREPARE_HIERARCHICAL_TOPIC_TRAINING ||
                scheduledEvent.getEventType() == ScheduledEventType.RUN_HIERARCHICAL_TOPIC_TRAINING)
            return handleTraining(scheduledEvent, entityManager);
        else if (scheduledEvent.getEventType() == ScheduledEventType.RESET_TOPIC_MODEL ||
                scheduledEvent.getEventType() == ScheduledEventType.FUSE_TOPIC_MODEL ||
                scheduledEvent.getEventType() == ScheduledEventType.SORT_TOPIC_MODEL)
            return handleCuration(scheduledEvent, entityManager);
        else
            return EventProcessingStatus.Error;
    }

    private EventProcessingStatus handleTraining(@NotNull ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        UUID trainingTaskRequestId = extractRequestIdFromEventData(scheduledEvent);
        if (trainingTaskRequestId == null)
            return EventProcessingStatus.Error;
        EventProcessingStatus status = null;

        try {
            RunTrainingConsistencyHandler runTrainingConsistencyHandler = applicationContext.getBean(RunTrainingConsistencyHandler.class);
            Boolean isConsistent = runTrainingConsistencyHandler.isConsistent(new RunTrainingConsistencyPredicates(trainingTaskRequestId));
            if (isConsistent) {
                TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
                Long runningTasks = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.PENDING)
                        .jobName(TRAIN_TOPIC_MODELS_SERVICE_NAME, TRAIN_DOMAIN_MODELS_SERVICE_NAME)
                        .count();
                if (runningTasks >= config.get().getParallelTrainingsThreshold()) {
                    logger.debug("Currently running tasks have reached the limit ({}), postponing train task to run again in {} seconds...", config.get().getParallelTrainingsThreshold(), config.get().getPostponePeriodInSeconds());
                    scheduledEvent.setRunAt(Instant.now().plusSeconds(config.get().getPostponePeriodInSeconds()));
                    status = EventProcessingStatus.Postponed;
                }

                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName(TRAIN_TOPIC_MODELS_SERVICE_NAME)
                        .ids(trainingTaskRequestId).first();
                try {
                    if (!EventProcessingStatus.Postponed.equals(status)) {
                        if (scheduledEvent.getEventType() == ScheduledEventType.RUN_ROOT_TOPIC_TRAINING)
                            runRootTraining(trainingTaskRequest, entityManager);
                        else if (scheduledEvent.getEventType() == ScheduledEventType.PREPARE_HIERARCHICAL_TOPIC_TRAINING)
                            prepareHierarchicalTraining(trainingTaskRequest, entityManager);
                        else if (scheduledEvent.getEventType() == ScheduledEventType.RUN_HIERARCHICAL_TOPIC_TRAINING)
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

    private EventProcessingStatus handleCuration(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        UUID trainingTaskRequestId = extractRequestIdFromEventData(scheduledEvent);
        if (trainingTaskRequestId == null)
            return EventProcessingStatus.Error;
        EventProcessingStatus status;

        try {
            RunTrainingConsistencyHandler runTrainingConsistencyHandler = applicationContext.getBean(RunTrainingConsistencyHandler.class);
            Boolean isConsistent = (runTrainingConsistencyHandler.isConsistent(new RunTrainingConsistencyPredicates(trainingTaskRequestId)));
            if (isConsistent) {
                TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName(TOPIC_MODEL_TASKS_SERVICE_NAME)
                        .ids(trainingTaskRequestId).first();
                try {
                    if (scheduledEvent.getEventType() == ScheduledEventType.RESET_TOPIC_MODEL)
                        runModelReset(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.FUSE_TOPIC_MODEL)
                        runModelFusion(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.SORT_TOPIC_MODEL)
                        runModelSort(trainingTaskRequest, scheduledEvent, entityManager);
                    status = EventProcessingStatus.Success;
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
        String logFile = trainingTaskRequest.getConfig().replace(TM_MODEL_CONFIG_FILE_NAME, "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running topic modeling task for request -> {}", containerId, trainingTaskRequest.getId());

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
        String logFile = config.replace(TM_MODEL_CONFIG_FILE_NAME, "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started preparing hierarchical topic modeling task for request -> {}", containerId, trainingTaskRequest.getId());

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
        String logFile = trainingTaskRequest.getConfig().replace(TM_MODEL_CONFIG_FILE_NAME, "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running hierarchical topic modeling task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runModelReset(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws IOException, ApiException {
        TopicModelTaskScheduledEventData eventData = jsonHandlingService.fromJsonSafe(TopicModelTaskScheduledEventData.class, scheduledEvent.getData());

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put(
                "COMMANDS",
                String.join(
                        " ",
                        "python", "manageModels.py",
                        ContainerServicesProperties.ManageTopicModels.PATH_TM_MODELS,
                        ContainerServicesProperties.ManageTopicModels.RESET_CMD,
                        eventData.getModelName()
                )
        );
        paramMap.put(
                "INPUT_REDIRECTION", "/dev/null"
        );
		String log_file = "model_task_log_" + new SecureRandom().nextInt();
		paramMap.put("LOG_FILE", "/data/temp/" + log_file);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running topic model reset task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runModelFusion(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws IOException, ApiException {
        FuseModelScheduledEventData eventData = jsonHandlingService.fromJsonSafe(FuseModelScheduledEventData.class, scheduledEvent.getData());

        String topics = jsonHandlingService.toJsonSafe(eventData.getTopics());

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());

        //Create temporary input file
        String tmp_file = "generated_" + new SecureRandom().nextInt();
        String contents = jsonHandlingService.toJsonSafe(topics).replaceAll("\"", "");
        dockerService.createInputFileInTempFolder(tmp_file, contents, DockerService.MANAGE_MODELS);

        Map<String, String> paramMap = new HashMap<>();
        String pythonCommand = String.join(
                " ",
                "python", "manageModels.py",
                ContainerServicesProperties.ManageTopicModels.PATH_TM_MODELS,
                ContainerServicesProperties.ManageTopicModels.FUSE_TOPICS_CMD,
                eventData.getModelName()
        );
        paramMap.put(
                "COMMANDS",
                pythonCommand
        );
        paramMap.put("INPUT_REDIRECTION", "/data/temp/" + tmp_file);
        String log_file = "model_task_log_" + new SecureRandom().nextInt();
		paramMap.put("LOG_FILE", "/data/temp/" + log_file);
        logger.debug(paramMap.get("COMMANDS"));
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running topic model fusion task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runModelSort(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws IOException, ApiException {
        TopicModelTaskScheduledEventData eventData = jsonHandlingService.fromJsonSafe(TopicModelTaskScheduledEventData.class, scheduledEvent.getData());

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put(
                "COMMANDS",
                String.join(
                        " ",
                        "python", "manageModels.py",
                        ContainerServicesProperties.ManageTopicModels.PATH_TM_MODELS,
                        ContainerServicesProperties.ManageTopicModels.SORT_TOPICS_CMD,
                        eventData.getModelName()
                )
        );
        paramMap.put(
                "INPUT_REDIRECTION", "/dev/null"
        );
		String log_file = "model_task_log_" + new SecureRandom().nextInt();
		paramMap.put("LOG_FILE", "/data/temp/" + log_file);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running topic model sorting task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private UUID extractRequestIdFromEventData(ScheduledEventEntity scheduledEvent) {
        UUID trainingId = null;
        if (scheduledEvent.getEventType() == ScheduledEventType.RUN_ROOT_TOPIC_TRAINING)
            trainingId = jsonHandlingService.fromJsonSafe(RunTrainingScheduledEventData.class, scheduledEvent.getData()).getTrainingTaskRequestId();
        else if (scheduledEvent.getEventType() == ScheduledEventType.PREPARE_HIERARCHICAL_TOPIC_TRAINING)
            trainingId = jsonHandlingService.fromJsonSafe(PrepareHierarchicalTrainingEventData.class, scheduledEvent.getData()).getTrainingTaskRequestId();
        else if (scheduledEvent.getEventType() == ScheduledEventType.RUN_HIERARCHICAL_TOPIC_TRAINING)
            trainingId = jsonHandlingService.fromJsonSafe(RunTrainingScheduledEventData.class, scheduledEvent.getData()).getTrainingTaskRequestId();
        else if (scheduledEvent.getEventType() == ScheduledEventType.FUSE_TOPIC_MODEL)
            trainingId = jsonHandlingService.fromJsonSafe(FuseModelScheduledEventData.class, scheduledEvent.getData()).getRequestId();
        else if (scheduledEvent.getEventType() == ScheduledEventType.RESET_TOPIC_MODEL)
            trainingId = jsonHandlingService.fromJsonSafe(TopicModelTaskScheduledEventData.class, scheduledEvent.getData()).getRequestId();
        else if (scheduledEvent.getEventType() == ScheduledEventType.SORT_TOPIC_MODEL)
            trainingId = jsonHandlingService.fromJsonSafe(TopicModelTaskScheduledEventData.class, scheduledEvent.getData()).getRequestId();
        if (trainingId == null) {
            logger.error("Unable to extract training task request id from the event data...");
            return null;
        } else
            return trainingId;
    }

}
