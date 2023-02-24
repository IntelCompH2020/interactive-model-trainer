package gr.cite.intelcomp.interactivemodeltrainer.service.execution;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Status;
import gr.cite.intelcomp.interactivemodeltrainer.data.ExecutionEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.ExecutionEntityManager;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class ExecutionServiceImpl implements ExecutionService{
    private final ExecutionEntityManager executionEntityManager;

    public ExecutionServiceImpl(ExecutionEntityManager executionEntityManager) {
        this.executionEntityManager = executionEntityManager;
    }

    @Override
    public void persist(ExecutionEntity entity) {
        this.executionEntityManager.persist(entity);
        this.executionEntityManager.flush();
    }

    @Override
    public void updateStatus(UUID id, Status status) {
        ExecutionEntity executionEntity = this.executionEntityManager.find(id);
        executionEntity.setStatus(status);
        executionEntity.setUpdatedAt(Instant.now());
        this.executionEntityManager.merge(executionEntity);
        this.executionEntityManager.flush();
    }
}
