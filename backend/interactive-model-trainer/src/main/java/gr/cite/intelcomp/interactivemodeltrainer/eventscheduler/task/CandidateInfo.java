package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.task;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;

import java.time.Instant;
import java.util.UUID;

public class CandidateInfo {
	private UUID id;
	private ScheduledEventStatus previousState;
	private Instant createdAt;

	public CandidateInfo() {
	}

	public CandidateInfo(UUID id, ScheduledEventStatus previousState, Instant createdAt) {
		this.id = id;
		this.previousState = previousState;
		this.createdAt = createdAt;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public ScheduledEventStatus getPreviousState() {
		return previousState;
	}

	public void setPreviousState(ScheduledEventStatus previousState) {
		this.previousState = previousState;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
}
