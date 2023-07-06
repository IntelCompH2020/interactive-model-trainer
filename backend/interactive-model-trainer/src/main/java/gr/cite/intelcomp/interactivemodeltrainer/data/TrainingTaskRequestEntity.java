package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "training_task_request")
public class TrainingTaskRequestEntity {

    @Id
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;
    public final static String _id = "id";

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;
    public final static String _creatorId = "creatorId";

    @Column(name = "job_id")
    private String jobId;
    public final static String _jobId = "jobId";

    @Column(name = "job_name")
    private String jobName;
    public final static String _jobName = "jobName";

    @Column(name = "config")
    private String config;
    public final static String _config = "config";

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TrainingTaskRequestStatus status;
    public final static String _status = "status";

    @Column(name = "is_active", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private IsActive isActive;
    public final static String _isActive = "isActive";

    @Column(name = "created_at")
    private Instant createdAt;
    public final static String _createdAt = "createdAt";

    @Column(name = "started_at")
    private Instant startedAt;
    public final static String _startedAt = "startedAt";

    @Column(name = "finished_at")
    private Instant finishedAt;
    public final static String _finishedAt = "finishedAt";

    @Column(name = "canceled_at")
    private Instant canceledAt;
    public final static String _canceledAt = "canceledAt";

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(UUID creatorId) {
        this.creatorId = creatorId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public TrainingTaskRequestStatus getStatus() {
        return status;
    }

    public void setStatus(TrainingTaskRequestStatus status) {
        this.status = status;
    }

    public IsActive getIsActive() {
        return isActive;
    }

    public void setIsActive(IsActive isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
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

    public Instant getCanceledAt() {
        return canceledAt;
    }

    public void setCanceledAt(Instant canceledAt) {
        this.canceledAt = canceledAt;
    }
}
