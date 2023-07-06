package gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainLabelsSelectionJsonModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicFusionPayload;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.exception.MyForbiddenException;
import gr.cite.tools.exception.MyNotFoundException;
import gr.cite.tools.exception.MyValidationException;
import io.kubernetes.client.openapi.ApiException;

import javax.management.InvalidApplicationException;
import jakarta.persistence.EntityManager;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;

public interface TrainingTaskRequestService {

    //TOPIC MODELS ------------------------------------

    TrainingTaskRequest persistTopicTrainingTaskForRootModel(TrainingTaskRequestPersist model) throws MyForbiddenException, MyValidationException, MyApplicationException, MyNotFoundException, InvalidApplicationException, NoSuchAlgorithmException, IOException, ApiException;
    TrainingTaskRequest persistTopicPreparingTaskForHierarchicalModel(TrainingTaskRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistTopicTrainingTaskForHierarchicalModel(TrainingTaskRequestPersist model, String jobId, UUID userId, EntityManager entityManager);
    TrainingTaskRequest persistTopicModelResetTask(TrainingTaskRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistTopicModelFusionTask(String name, TopicFusionPayload payload) throws InvalidApplicationException;
    TrainingTaskRequest persistTopicModelSortTask(String name) throws InvalidApplicationException;

    //DOMAIN MODELS -----------------------------------

    TrainingTaskRequest persistDomainTrainingTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistDomainRetrainingTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistDomainClassifyTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistDomainEvaluateTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistDomainSampleTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistDomainFeedbackTaskForRootModel(DomainClassificationRequestPersist model, DomainLabelsSelectionJsonModel labels) throws InvalidApplicationException;

    //GENERAL -----------------------------------------

    TrainingTaskRequestStatus getTaskStatus(UUID task);
    void clearFinishedTask(UUID task);
    void cancelTask(UUID task);
    void clearAllFinishedTasks(RunningTaskType type);
    List<? extends RunningTaskQueueItem> getRunningTasks(RunningTaskType type) throws JsonProcessingException;
}
