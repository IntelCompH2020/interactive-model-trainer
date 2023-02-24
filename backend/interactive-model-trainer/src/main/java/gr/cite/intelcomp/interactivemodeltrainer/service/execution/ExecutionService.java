package gr.cite.intelcomp.interactivemodeltrainer.service.execution;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Status;
import gr.cite.intelcomp.interactivemodeltrainer.data.ExecutionEntity;

import java.util.UUID;


public interface ExecutionService {

    void persist(ExecutionEntity entity);

    void updateStatus(UUID id, Status status);

}
