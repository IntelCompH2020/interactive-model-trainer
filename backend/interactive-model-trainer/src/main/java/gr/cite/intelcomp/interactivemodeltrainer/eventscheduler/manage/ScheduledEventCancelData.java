package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;

public class ScheduledEventCancelData {
	private ScheduledEventType type;
	private String key;
	private String keyType;

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
}
