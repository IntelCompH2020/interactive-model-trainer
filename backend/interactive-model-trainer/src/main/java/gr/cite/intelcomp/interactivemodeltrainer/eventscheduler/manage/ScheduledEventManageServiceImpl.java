package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage;

import gr.cite.intelcomp.interactivemodeltrainer.audit.AuditableAction;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.query.ScheduledEventQuery;
import gr.cite.tools.auditing.AuditService;
import gr.cite.tools.data.query.QueryFactory;
import gr.cite.tools.exception.MyNotFoundException;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequestScope
public class ScheduledEventManageServiceImpl implements ScheduledEventManageService {
	private final EntityManager entityManager;
	private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(ScheduledEventManageServiceImpl.class));

	private final AuditService auditService;
	private final MessageSource messageSource;
	private final QueryFactory queryFactory;

	@Autowired
	public ScheduledEventManageServiceImpl(
			EntityManager entityManager,
			AuditService auditService,
			MessageSource messageSource,
			QueryFactory queryFactory
	) {
		this.entityManager = entityManager;
		this.auditService = auditService;
		this.messageSource = messageSource;
		this.queryFactory = queryFactory;
	}

	@Override
	public void publishAsync(ScheduledEventPublishData item) {
		ScheduledEventEntity data = new ScheduledEventEntity();
		data.setId(UUID.randomUUID());
		data.setKey(item.getKey());
		data.setEventType(item.getType());
		data.setKeyType(item.getKeyType());
		data.setCreatorId(item.getCreatorId());
		data.setRunAt(item.getRunAt());
		data.setData(item.getData());
		data.setStatus(ScheduledEventStatus.PENDING);
		data.setIsActive(IsActive.ACTIVE);
		data.setRetryCount(0);
		data.setCreatedAt(Instant.now());
		this.entityManager.persist(data);
		this.entityManager.flush();

		this.auditService.track(AuditableAction.Scheduled_Event_Persist, "event", data);
	}

	@Override
	public void publishAsync(ScheduledEventPublishData item, EntityManager entityManager) {
		ScheduledEventEntity data = new ScheduledEventEntity();
		data.setId(UUID.randomUUID());
		data.setKey(item.getKey());
		data.setEventType(item.getType());
		data.setKeyType(item.getKeyType());
		data.setCreatorId(item.getCreatorId());
		data.setRunAt(item.getRunAt());
		data.setData(item.getData());
		data.setStatus(ScheduledEventStatus.PENDING);
		data.setIsActive(IsActive.ACTIVE);
		data.setRetryCount(0);
		data.setCreatedAt(Instant.now());
		entityManager.persist(data);
	}

	@Override
	public void cancelAsync(ScheduledEventCancelData item) {
		List<ScheduledEventEntity> events = this.queryFactory.query(ScheduledEventQuery.class).eventTypes(item.getType()).status(ScheduledEventStatus.PENDING, ScheduledEventStatus.ERROR).keyTypes(item.getKeyType()).keys(item.getKey()).collect();
		for (ScheduledEventEntity data : events) {
			data.setStatus(ScheduledEventStatus.CANCELED);

			this.entityManager.merge(data);
		}
		this.auditService.track(AuditableAction.Scheduled_Event_Canceled, "item", item);
		this.entityManager.flush();
	}

	@Override
	public void cancelAsync(UUID id) {
		ScheduledEventEntity data = this.entityManager.find(ScheduledEventEntity.class, id);
		if (data == null) throw new MyNotFoundException(messageSource.getMessage("General_ItemNotFound", new Object[]{id, ScheduledEventEntity.class.getSimpleName()}, LocaleContextHolder.getLocale()));
		data.setStatus(ScheduledEventStatus.CANCELED);

		this.entityManager.merge(data);
		this.entityManager.flush();

		this.auditService.track(AuditableAction.Scheduled_Event_Canceled, "id", data);
	}

	@Override
	public void deleteAsync(UUID id, EntityManager entityManager) {
		ScheduledEventEntity data = entityManager.find(ScheduledEventEntity.class, id);
		if (data == null) return;

		entityManager.remove(data);
	}
}
