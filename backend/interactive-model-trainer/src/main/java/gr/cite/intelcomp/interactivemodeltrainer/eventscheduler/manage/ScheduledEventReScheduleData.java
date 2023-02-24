package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;

import java.time.Instant;

public class ScheduledEventReScheduleData {
	private ScheduledEventType type;
	private String key;
	private String keyType;
	private Instant runAt;
	private String data;

	public ScheduledEventType getType() {
		return type;
	}

	public void setType(ScheduledEventType type) {
		this.type = type;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getKeyType() {
		return keyType;
	}

	public void setKeyType(String keyType) {
		this.keyType = keyType;
	}

	public Instant getRunAt() {
		return runAt;
	}

	public void setRunAt(Instant runAt) {
		this.runAt = runAt;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
}
