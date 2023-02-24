package gr.cite.intelcomp.interactivemodeltrainer.query;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.tools.data.query.FieldResolver;
import gr.cite.tools.data.query.Ordering;
import gr.cite.tools.data.query.QueryBase;
import gr.cite.tools.data.query.QueryContext;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ScheduledEventQuery extends QueryBase<ScheduledEventEntity> {

	private Collection<UUID> ids;
	private Collection<String> keys;
	private Collection<String> keyTypes;
	private Collection<ScheduledEventType> eventTypes;
	private Instant createdAfter;
	private Instant shouldRunBefore;
	private Collection<IsActive> isActives;
	private Collection<ScheduledEventStatus> status;
	private Integer retryThreshold;

	public ScheduledEventQuery ids(UUID value) {
		this.ids = List.of(value);
		return this;
	}

	public ScheduledEventQuery ids(UUID... value) {
		this.ids = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery ids(List<UUID> value) {
		this.ids = value;
		return this;
	}

	public ScheduledEventQuery keys(String value) {
		this.keys = List.of(value);
		return this;
	}

	public ScheduledEventQuery keys(String... value) {
		this.keys = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery keys(List<String> value) {
		this.keys = value;
		return this;
	}


	public ScheduledEventQuery keyTypes(String value) {
		this.keyTypes = List.of(value);
		return this;
	}

	public ScheduledEventQuery keyTypes(String... value) {
		this.keyTypes = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery keyTypes(List<String> value) {
		this.keyTypes = value;
		return this;
	}

	public ScheduledEventQuery isActives(IsActive value) {
		this.isActives = List.of(value);
		return this;
	}

	public ScheduledEventQuery isActives(IsActive... value) {
		this.isActives = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery isActives(List<IsActive> value) {
		this.isActives = value;
		return this;
	}


	public ScheduledEventQuery status(ScheduledEventStatus value) {
		this.status = List.of(value);
		return this;
	}

	public ScheduledEventQuery status(ScheduledEventStatus... value) {
		this.status = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery status(List<ScheduledEventStatus> value) {
		this.status = value;
		return this;
	}


	public ScheduledEventQuery eventTypes(ScheduledEventType value) {
		this.eventTypes = List.of(value);
		return this;
	}

	public ScheduledEventQuery eventTypes(ScheduledEventType... value) {
		this.eventTypes = Arrays.asList(value);
		return this;
	}

	public ScheduledEventQuery eventTypes(List<ScheduledEventType> value) {
		this.eventTypes = value;
		return this;
	}

	public ScheduledEventQuery createdAfter(Instant value) {
		this.createdAfter = value;
		return this;
	}

	public ScheduledEventQuery shouldRunBefore(Instant value) {
		this.shouldRunBefore = value;
		return this;
	}

	public ScheduledEventQuery retryThreshold(Integer value) {
		this.retryThreshold = value;
		return this;
	}

	public ScheduledEventQuery ordering(Ordering ordering) {
		this.setOrder(ordering);
		return this;
	}

	@Override
	protected Class<ScheduledEventEntity> entityClass() {
		return ScheduledEventEntity.class;
	}

	@Override
	protected Boolean isFalseQuery() {
//		return this.isEmpty(this.ids) || this.isEmpty(this.isActives) || this.isEmpty(this.keyTypes)
//				|| this.isEmpty(this.keys) || this.isEmpty(this.status) || this.isEmpty(this.eventTypes);
		return false;
	}

	@Override
	protected <X, Y> Predicate applyFilters(QueryContext<X, Y> queryContext) {
		List<Predicate> predicates = new ArrayList<>();
		if (this.ids != null) {
			CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(ScheduledEventEntity._id));
			for (UUID item : this.ids) inClause.value(item);
			predicates.add(inClause);
		}

		if (this.shouldRunBefore != null) {
			predicates.add(queryContext.CriteriaBuilder.lessThanOrEqualTo(queryContext.Root.get(ScheduledEventEntity._runAt), this.shouldRunBefore));
		}

		if (this.createdAfter != null) {
			predicates.add(queryContext.CriteriaBuilder.greaterThan(queryContext.Root.get(ScheduledEventEntity._createdAt), this.createdAfter));
		}
		if (this.isActives != null) {
			CriteriaBuilder.In<IsActive> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(ScheduledEventEntity._isActive));
			for (IsActive item : this.isActives) inClause.value(item);
			predicates.add(inClause);
		}
		if (this.keyTypes != null) {
			CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(ScheduledEventEntity._keyType));
			for (String item : this.keyTypes) inClause.value(item);
			predicates.add(inClause);
		}
		if (this.keys != null) {
			CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(ScheduledEventEntity._key));
			for (String item : this.keys) inClause.value(item);
			predicates.add(inClause);
		}

		if (this.status != null) {
			CriteriaBuilder.In<ScheduledEventStatus> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(ScheduledEventEntity._status));
			for (ScheduledEventStatus item : this.status) inClause.value(item);
			predicates.add(inClause);
		}

		if (this.retryThreshold != null) {
			predicates.add(queryContext.CriteriaBuilder.or(queryContext.CriteriaBuilder.isNull(queryContext.Root.get(ScheduledEventEntity._retryCount)),
					queryContext.CriteriaBuilder.lessThanOrEqualTo(queryContext.Root.get(ScheduledEventEntity._retryCount), this.retryThreshold)));
		}

		if (predicates.size() > 0) {
			Predicate[] predicatesArray = predicates.toArray(new Predicate[0]);
			return queryContext.CriteriaBuilder.and(predicatesArray);
		} else {
			return null;
		}
	}

	@Override
	protected ScheduledEventEntity convert(Tuple tuple, Set<String> columns) {
		ScheduledEventEntity item = new ScheduledEventEntity();
		item.setId(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._id, UUID.class));
		item.setKey(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._key, String.class));
		item.setEventType(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._eventType, ScheduledEventType.class));
		item.setRunAt(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._runAt, Instant.class));
		item.setCreatorId(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._creatorId, UUID.class));
		item.setKeyType(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._keyType, String.class));
		item.setData(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._data, String.class));
		item.setCreatedAt(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._createdAt, Instant.class));
		item.setIsActive(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._isActive, IsActive.class));
		item.setStatus(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._status, ScheduledEventStatus.class));
		item.setRetryCount(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._retryCount, Integer.class));
		item.setCreatedAt(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._createdAt, Instant.class));
		item.setUpdatedAt(QueryBase.convertSafe(tuple, columns, ScheduledEventEntity._updatedAt, Instant.class));
		return item;
	}

	@Override
	protected String fieldNameOf(FieldResolver item) {
		if (item.match(ScheduledEventEntity._id)) return ScheduledEventEntity._id;
		else if (item.match(ScheduledEventEntity._createdAt)) return ScheduledEventEntity._createdAt;
		else if (item.match(ScheduledEventEntity._key)) return ScheduledEventEntity._key;
		else if (item.match(ScheduledEventEntity._eventType)) return ScheduledEventEntity._eventType;
		else if (item.match(ScheduledEventEntity._runAt)) return ScheduledEventEntity._runAt;
		else if (item.match(ScheduledEventEntity._creatorId)) return ScheduledEventEntity._creatorId;
		else if (item.match(ScheduledEventEntity._keyType)) return ScheduledEventEntity._keyType;
		else if (item.match(ScheduledEventEntity._data)) return ScheduledEventEntity._data;
		else if (item.match(ScheduledEventEntity._isActive)) return ScheduledEventEntity._isActive;
		else if (item.match(ScheduledEventEntity._status)) return ScheduledEventEntity._status;
		else if (item.match(ScheduledEventEntity._retryCount)) return ScheduledEventEntity._retryCount;
		else if (item.match(ScheduledEventEntity._createdAt)) return ScheduledEventEntity._createdAt;
		else if (item.match(ScheduledEventEntity._updatedAt)) return ScheduledEventEntity._updatedAt;
		else return null;
	}
}
