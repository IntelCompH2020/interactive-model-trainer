package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class CheckTasksScheduledEventData {

	private final UUID previousCheckingEvent;

	@JsonCreator
	public CheckTasksScheduledEventData(@JsonProperty("previousCheckingEvent") UUID previousCheckingEvent) {
		this.previousCheckingEvent = previousCheckingEvent;
	}

	public UUID getPreviousCheckingEvent() {
		return previousCheckingEvent;
	}
}
