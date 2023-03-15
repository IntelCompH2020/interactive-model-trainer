package gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskRequest;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.exception.MyForbiddenException;
import gr.cite.tools.exception.MyNotFoundException;
import gr.cite.tools.exception.MyValidationException;
import io.kubernetes.client.openapi.ApiException;

import javax.management.InvalidApplicationException;
import javax.persistence.EntityManager;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public interface TrainingTaskRequestService {

    //TOPIC MODELS ------------------------------------

    TrainingTaskRequest persistTrainingTaskForRootModel(TrainingTaskRequestPersist model) throws MyForbiddenException, MyValidationException, MyApplicationException, MyNotFoundException, InvalidApplicationException, NoSuchAlgorithmException, IOException, ApiException;
    TrainingTaskRequest persistPreparingTaskForHierarchicalModel(TrainingTaskRequestPersist model) throws InvalidApplicationException;
    TrainingTaskRequest persistTrainingTaskForHierarchicalModel(TrainingTaskRequestPersist model, UUID userId, EntityManager entityManager);
    TrainingTaskRequest persistModelResetTask(TrainingTaskRequestPersist model) throws InvalidApplicationException;

    //DOMAIN MODELS -----------------------------------

    TrainingTaskRequest persistDomainTrainingTaskForRootModel(DomainClassificationRequestPersist model) throws InvalidApplicationException;

    //GENERAL -----------------------------------------

    TrainingTaskRequestStatus getTaskStatus(UUID task);

}
