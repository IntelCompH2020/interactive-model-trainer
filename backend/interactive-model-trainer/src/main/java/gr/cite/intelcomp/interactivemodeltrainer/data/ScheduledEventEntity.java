package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scheduled_event")
public class ScheduledEventEntity {
	@Id
	@Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
	private UUID id;
	public final static String _id = "id";

	@Column(name = "key", nullable = false, length = 200)
	private String key;
	public final static String _key = "key";

	@Column(name = "event_type", nullable = false, length = 200)
	@Enumerated(EnumType.STRING)
	private ScheduledEventType eventType;
	public final static String _eventType = "eventType";

	@Column(name = "run_at", nullable = false)
	private Instant runAt;
	public final static String _runAt = "runAt";

	@Column(name = "creator", nullable = true)
	private UUID creatorId;
	public final static String _creatorId = "creatorId";

	@Column(name = "key_type", nullable = false, length = 200)
	private String keyType;
	public final static String _keyType = "keyType";

	@Column(name = "data", columnDefinition = "json")
	private String data;
	public final static String _data = "data";

	@Column(name = "retry_count", nullable = false)
	private Integer retryCount;
	public final static String _retryCount = "retryCount";

	//TODO: as integer
	@Column(name = "is_active", length = 20, nullable = false)
	@Enumerated(EnumType.STRING)
	private IsActive isActive;
	public final static String _isActive = "isActive";

	//TODO: as integer
	@Column(name = "status", length = 100, nullable = false)
	@Enumerated(EnumType.STRING)
	private ScheduledEventStatus status;
	public final static String _status = "status";

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
	public final static String _createdAt = "createdAt";

	@Column(name = "updated_at", nullable = false)
	@Version
	private Instant updatedAt;
	public final static String _updatedAt = "updatedAt";

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String entity) {
		this.key = entity;
	}

	public ScheduledEventType getEventType() {
		return eventType;
	}

	public void setEventType(ScheduledEventType eventType) {
		this.eventType = eventType;
	}

	public Instant getRunAt() {
		return runAt;
	}

	public void setRunAt(Instant runAt) {
		this.runAt = runAt;
	}

	public UUID getCreatorId() {
		return creatorId;
	}

	public void setCreatorId(UUID creatorId) {
		this.creatorId = creatorId;
	}

	public String getKeyType() {
		return keyType;
	}

	public void setKeyType(String keyType) {
		this.keyType = keyType;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public Integer getRetryCount() {
		return retryCount;
	}

	public void setRetryCount(Integer retryCount) {
		this.retryCount = retryCount;
	}

	public IsActive getIsActive() {
		return isActive;
	}

	public void setIsActive(IsActive isActive) {
		this.isActive = isActive;
	}

	public ScheduledEventStatus getStatus() {
		return status;
	}

	public void setStatus(ScheduledEventStatus status) {
		this.status = status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}

