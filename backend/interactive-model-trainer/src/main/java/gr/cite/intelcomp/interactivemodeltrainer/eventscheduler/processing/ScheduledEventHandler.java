package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;

import jakarta.persistence.EntityManager;

public interface ScheduledEventHandler {
	EventProcessingStatus handle(ScheduledEventEntity scheduledEvent, EntityManager entityManager) throws JsonProcessingException;
}
