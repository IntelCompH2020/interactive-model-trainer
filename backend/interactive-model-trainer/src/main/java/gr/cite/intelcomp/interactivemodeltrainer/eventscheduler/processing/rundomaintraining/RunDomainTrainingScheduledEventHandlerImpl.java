package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.rundomaintraining;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.audit.AuditableAction;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.EventProcessingStatus;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.config.RunTrainingSchedulerEventConfig;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.query.TrainingTaskRequestQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerManagementService;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.tools.auditing.AuditService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.jetbrains.annotations.NotNull;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.TRAIN_DOMAIN_MODELS_SERVICE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.TRAIN_TOPIC_MODELS_SERVICE_NAME;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunDomainTrainingScheduledEventHandlerImpl implements RunDomainTrainingScheduledEventHandler {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunDomainTrainingScheduledEventHandlerImpl.class));
    private final JsonHandlingService jsonHandlingService;
    private final ApplicationContext applicationContext;
    private final RunTrainingSchedulerEventConfig config;

    private final ContainerServicesProperties containerServicesProperties;

    public RunDomainTrainingScheduledEventHandlerImpl(JsonHandlingService jsonHandlingService, ApplicationContext applicationContext, RunTrainingSchedulerEventConfig config, ContainerServicesProperties containerServicesProperties) {
        this.jsonHandlingService = jsonHandlingService;
        this.applicationContext = applicationContext;
        this.config = config;
        this.containerServicesProperties = containerServicesProperties;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_ROOT_DOMAIN_TRAINING)) {
            return handleTraining(scheduledEvent, entityManager);
        } else if (
                scheduledEvent.getEventType() == ScheduledEventType.RETRAIN_DOMAIN_MODEL ||
                        scheduledEvent.getEventType() == ScheduledEventType.CLASSIFY_DOMAIN_MODEL ||
                        scheduledEvent.getEventType() == ScheduledEventType.EVALUATE_DOMAIN_MODEL ||
                        scheduledEvent.getEventType() == ScheduledEventType.SAMPLE_DOMAIN_MODEL ||
                        scheduledEvent.getEventType() == ScheduledEventType.GIVE_FEEDBACK_DOMAIN_MODEL
        ) {
            return handleCurating(scheduledEvent, entityManager);
        } else return EventProcessingStatus.Error;
    }

    private EventProcessingStatus handleTraining(@NotNull ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        UUID trainingTaskRequestId = extractRequestIdFromEventData(scheduledEvent);
        if (trainingTaskRequestId == null) return EventProcessingStatus.Error;
        EventProcessingStatus status = null;

        try {
            RunDomainTrainingConsistencyHandler runDomainTrainingConsistencyHandler = applicationContext.getBean(RunDomainTrainingConsistencyHandler.class);
            Boolean isConsistent = runDomainTrainingConsistencyHandler.isConsistent(new RunDomainTrainingConsistencyPredicates());
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
                        .jobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME)
                        .ids(trainingTaskRequestId).first();
                try {
                    if (EventProcessingStatus.Postponed != status) {
                        if (scheduledEvent.getEventType() == ScheduledEventType.RUN_ROOT_DOMAIN_TRAINING)
                            runRootTraining(trainingTaskRequest, scheduledEvent, entityManager);
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
                    logger.error(e);
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

    private EventProcessingStatus handleCurating(@NotNull ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        UUID trainingTaskRequestId = extractRequestIdFromEventData(scheduledEvent);
        if (trainingTaskRequestId == null) return EventProcessingStatus.Error;
        EventProcessingStatus status;

        try {
            RunDomainTrainingConsistencyHandler runDomainTrainingConsistencyHandler = applicationContext.getBean(RunDomainTrainingConsistencyHandler.class);
            Boolean isConsistent = runDomainTrainingConsistencyHandler.isConsistent(new RunDomainTrainingConsistencyPredicates());
            if (isConsistent) {
                TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName(TRAIN_DOMAIN_MODELS_SERVICE_NAME)
                        .ids(trainingTaskRequestId).first();
                try {
                    if (scheduledEvent.getEventType() == ScheduledEventType.RETRAIN_DOMAIN_MODEL)
                        runRootRetraining(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.CLASSIFY_DOMAIN_MODEL)
                        runRootClassification(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.EVALUATE_DOMAIN_MODEL)
                        runRootEvaluation(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.SAMPLE_DOMAIN_MODEL)
                        runRootSampling(trainingTaskRequest, scheduledEvent, entityManager);
                    else if (scheduledEvent.getEventType() == ScheduledEventType.GIVE_FEEDBACK_DOMAIN_MODEL)
                        runRootFeedback(trainingTaskRequest, scheduledEvent, entityManager);
                    status = EventProcessingStatus.Success;
                } catch (Exception e) {
                    status = EventProcessingStatus.Error;
                    logger.error(e);
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

    private void runRootTraining(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();
        params.put("corpus_name", request.getCorpus());
        params.put("tag", request.getName());
        if (request.getKeywords() != null && !request.getKeywords().isEmpty())
            params.put("keywords", "\"" + request.getKeywords() + "\"");
        else params.put("keywords", "");
        if ("on_create_category_name".equals(request.getTask())) {
            params.put("zeroshot", containerServicesProperties.getDomainTrainingService().getZeroShotModelFolder());
        }

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        eventData.getRequest().getParameters().forEach((key, val) -> {
            if (key.startsWith("DC.")) params.put(key.replace("DC.", ""), val);
            if (key.startsWith("classifier.")) params.put(key.replace("classifier.", ""), val);
            if (key.startsWith("AL.")) params.put(key.replace("AL.", ""), val);
        });

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), request.getTag(), request.getTask(), params));
        logger.debug("COMMANDS -> {}", commands);
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, "execution.log");
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model training task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runRootRetraining(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        Objects.requireNonNull(eventData.getRequest().getParameters());
        eventData.getRequest().getParameters().forEach((key, val) -> {
            if (key.startsWith("classifier.")) params.put(key.replace("classifier.", ""), val);
        });

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), eventData.getRequest().getTag(), "on_retrain", params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, DC_MODEL_RETRAIN_LOG_FILE_NAME);
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model retraining task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runRootClassification(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        Objects.requireNonNull(eventData.getRequest());

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), eventData.getRequest().getTag(), "on_classify", params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, DC_MODEL_CLASSIFY_LOG_FILE_NAME);
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model classification task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runRootEvaluation(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        Objects.requireNonNull(eventData.getRequest().getParameters());
        eventData.getRequest().getParameters().forEach((key, val) -> {
            if (key.startsWith("evaluator.")) params.put(key.replace("evaluator.", ""), val);
        });

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), eventData.getRequest().getTag(), "on_evaluate", params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, DC_MODEL_EVALUATE_LOG_FILE_NAME);
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model evaluation task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runRootSampling(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        Objects.requireNonNull(eventData.getRequest().getParameters());
        eventData.getRequest().getParameters().forEach((key, val) -> {
            if (key.startsWith("sampler.") && val != null) params.put(key.replace("sampler.", ""), val);
        });

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), eventData.getRequest().getTag(), "on_sample", params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, DC_MODEL_SAMPLE_LOG_FILE_NAME);
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model sampling task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private void runRootFeedback(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();

        RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJsonSafe(RunDomainTrainingScheduledEventData.class, event.getData());
        Objects.requireNonNull(eventData.getRequest());

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), eventData.getRequest().getTag(), "on_save_feedback", params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace(DC_MODEL_CONFIG_FILE_NAME, DC_MODEL_FEEDBACK_LOG_FILE_NAME);
        paramMap.put("LOG_FILE", logFile);
        executionParams.setEnvMapping(paramMap);
        ContainerManagementService containerManagementService = applicationContext.getBean(ContainerManagementService.class);
        String containerId = containerManagementService.runJob(executionParams);
        logger.info("Container '{}' started running domain model feedback task for request -> {}", containerId, trainingTaskRequest.getId());

        TrainingTaskRequestQuery trainingTaskRequestQuery = applicationContext.getBean(TrainingTaskRequestQuery.class);
        TrainingTaskRequestEntity task = trainingTaskRequestQuery.ids(trainingTaskRequest.getId()).first();
        task.setStartedAt(Instant.now());
        task.setStatus(TrainingTaskRequestStatus.PENDING);
        entityManager.merge(task);
        entityManager.flush();
    }

    private UUID extractRequestIdFromEventData(ScheduledEventEntity scheduledEvent) {
        try {
            RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJson(RunDomainTrainingScheduledEventData.class, scheduledEvent.getData());
            return eventData.getTrainingTaskRequestId();
        } catch (JsonProcessingException e) {
            logger.error("Unable to extract training task request id from the event data...");
            logger.error(e.getLocalizedMessage(), e);
            return null;
        }
    }

    private DomainClassificationRequestPersist extractRequestBodyFromEventData(ScheduledEventEntity scheduledEvent) {
        try {
            RunDomainTrainingScheduledEventData eventData = jsonHandlingService.fromJson(RunDomainTrainingScheduledEventData.class, scheduledEvent.getData());
            return eventData.getRequest();
        } catch (JsonProcessingException e) {
            logger.error("Unable to extract training task request id from the event data...");
            logger.error(e.getLocalizedMessage(), e);
            return null;
        }
    }

}
