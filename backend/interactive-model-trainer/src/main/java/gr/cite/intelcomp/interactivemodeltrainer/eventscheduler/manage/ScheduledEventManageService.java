package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage;

import javax.management.InvalidApplicationException;
import jakarta.persistence.EntityManager;
import java.util.UUID;

public interface ScheduledEventManageService {
	void publishAsync(ScheduledEventPublishData item);

	void publishAsync(ScheduledEventPublishData item, EntityManager entityManager);

	void cancelAsync(ScheduledEventCancelData item) throws InvalidApplicationException;

	void cancelAsync(UUID id) throws InvalidApplicationException;

	void deleteAsync(UUID id, EntityManager entityManager);
}
