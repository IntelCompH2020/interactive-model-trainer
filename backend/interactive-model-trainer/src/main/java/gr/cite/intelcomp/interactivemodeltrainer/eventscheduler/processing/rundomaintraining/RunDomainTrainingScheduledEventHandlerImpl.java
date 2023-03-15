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

import javax.persistence.EntityManager;
import java.io.IOException;
import java.time.Instant;
import java.util.AbstractMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunDomainTrainingScheduledEventHandlerImpl implements RunDomainTrainingScheduledEventHandler {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunDomainTrainingScheduledEventHandlerImpl.class));
    private final JsonHandlingService jsonHandlingService;
    private final ApplicationContext applicationContext;
    private final RunTrainingSchedulerEventConfig config;

    public RunDomainTrainingScheduledEventHandlerImpl(JsonHandlingService jsonHandlingService, ApplicationContext applicationContext, RunTrainingSchedulerEventConfig config) {
        this.jsonHandlingService = jsonHandlingService;
        this.applicationContext = applicationContext;
        this.config = config;
    }

    @Override
    public EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) {
        if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_ROOT_TRAINING)) {
            return handleTraining(scheduledEvent, entityManager);
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
                        .jobName("trainModels", "trainDomainModels")
                        .count();
                if (runningTasks >= config.get().getParallelTrainingsThreshold()) {
                    logger.debug("Currently running tasks have reached the limit ({}), postponing train task to run again in {} seconds...", config.get().getParallelTrainingsThreshold(), config.get().getPostponePeriodInSeconds());
                    scheduledEvent.setRunAt(Instant.now().plusSeconds(config.get().getPostponePeriodInSeconds()));
                    status = EventProcessingStatus.Postponed;
                }

                TrainingTaskRequestEntity trainingTaskRequest = trainingTaskRequestQuery
                        .status(TrainingTaskRequestStatus.NEW)
                        .jobName("trainDomainModels")
                        .ids(trainingTaskRequestId).first();
                try {
                    if (!EventProcessingStatus.Postponed.equals(status)) {
                        if (scheduledEvent.getEventType().equals(ScheduledEventType.RUN_ROOT_DOMAIN_TRAINING))
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

    private void runRootTraining(TrainingTaskRequestEntity trainingTaskRequest, ScheduledEventEntity event, EntityManager entityManager) throws IOException, ApiException {
        DomainClassificationRequestPersist request = extractRequestBodyFromEventData(event);
        if (request == null) return;

        ExecutionParams executionParams = new ExecutionParams(trainingTaskRequest.getJobName(), trainingTaskRequest.getJobId());
        Map<String, String> paramMap = new HashMap<>();

        HashMap<String, String> params = new HashMap<>();
        params.put("corpus_name", request.getCorpus());
        params.put("tag", request.getTag());
        params.put("keywords", request.getKeywords());

        String commands = String.join(" ", ContainerServicesProperties.ManageDomainModels.TASK_CMD(request.getName(), request.getTask(), params));
        paramMap.put("COMMANDS", commands);
        String logFile = trainingTaskRequest.getConfig().replace("dc_config.json", "execution.log");
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
