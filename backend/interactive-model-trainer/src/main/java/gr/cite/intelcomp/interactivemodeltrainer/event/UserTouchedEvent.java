package gr.cite.intelcomp.interactivemodeltrainer.event;

import java.util.UUID;

public class UserTouchedEvent {
	public UserTouchedEvent() {
	}

	public UserTouchedEvent(UUID userId, String subjectId, String previousSubjectId) {
		this.userId = userId;
		this.subjectId = subjectId;
		this.previousSubjectId = previousSubjectId;
	}

	private UUID userId;
	private String subjectId;
	private String previousSubjectId;

	public UUID getUserId() {
		return userId;
	}

	public void setUserId(UUID userId) {
		this.userId = userId;
	}

	public String getSubjectId() {
		return subjectId;
	}

	public void setSubjectId(String subjectId) {
		this.subjectId = subjectId;
	}

	public String getPreviousSubjectId() {
		return previousSubjectId;
	}

	public void setPreviousSubjectId(String previousSubjectId) {
		this.previousSubjectId = previousSubjectId;
	}
}
