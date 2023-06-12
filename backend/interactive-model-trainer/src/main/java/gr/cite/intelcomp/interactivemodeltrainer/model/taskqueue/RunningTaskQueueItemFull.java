package gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue;

import java.time.Instant;
import java.util.UUID;

public class RunningTaskQueueItemFull {

    private String label;
    private boolean finished;
    private Object payload;
    private UUID task;
    private RunningTaskType type;
    private RunningTaskSubType subType;
    private Instant startedAt;
    private Instant finishedAt;
    private RunningTaskResponseFull response;
    private UUID userId;

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public UUID getTask() {
        return task;
    }

    public void setTask(UUID task) {
        this.task = task;
    }

    public RunningTaskType getType() {
        return type;
    }

    public void setType(RunningTaskType type) {
        this.type = type;
    }

    public RunningTaskSubType getSubType() {
        return subType;
    }

    public void setSubType(RunningTaskSubType subType) {
        this.subType = subType;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }

    public RunningTaskResponseFull getResponse() {
        return response;
    }

    public void setResponse(RunningTaskResponseFull response) {
        this.response = response;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

}
