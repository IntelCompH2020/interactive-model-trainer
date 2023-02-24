package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Status;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.data.ExecutionEntity;
import gr.cite.intelcomp.interactivemodeltrainer.service.execution.ExecutionService;

import java.time.Instant;
import java.util.UUID;

public abstract class ContainerManagementServiceImpl implements ContainerManagementService {
    protected final UserScope userScope;
    protected final ExecutionService executionService;

    protected ContainerManagementServiceImpl(UserScope userScope, ExecutionService executionService) {
        this.userScope = userScope;
        this.executionService = executionService;
    }


    protected ExecutionEntity initializeExecution(CommandType type, String cmd){
        ExecutionEntity executionEntity = new ExecutionEntity();
        executionEntity.setId(UUID.randomUUID());
        executionEntity.setCreatedAt(Instant.now());
        executionEntity.setUserId(this.userScope.getUserIdSafe());
        executionEntity.setType(type);
        executionEntity.setCommand(cmd);
        executionEntity.setStatus(Status.NEW);
        executionEntity.setExecutedAt(Instant.now());
        return executionEntity;
    }

    protected void finishAndUpdateExecution(ExecutionEntity executionEntity, String result){
        executionEntity.setFinishedAt(Instant.now());
        executionEntity.setStatus(Status.FINISHED);
        executionEntity.setResult(result);
        executionEntity.setUpdatedAt(Instant.now());
        this.executionService.persist(executionEntity);
    }

}
