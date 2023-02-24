package gr.cite.intelcomp.interactivemodeltrainer.query;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.data.TrainingTaskRequestEntity;
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
public class TrainingTaskRequestQuery extends QueryBase<TrainingTaskRequestEntity> {

    private Collection<UUID> ids;
    private Collection<IsActive> isActives;
    private Collection<TrainingTaskRequestStatus> status;
    private Collection<String> jobName;

    public TrainingTaskRequestQuery ids(UUID value) {
        this.ids = List.of(value);
        return this;
    }

    public TrainingTaskRequestQuery ids(UUID... value) {
        this.ids = Arrays.asList(value);
        return this;
    }

    public TrainingTaskRequestQuery ids(List<UUID> value) {
        this.ids = value;
        return this;
    }

    public TrainingTaskRequestQuery isActives(IsActive value) {
        this.isActives = List.of(value);
        return this;
    }

    public TrainingTaskRequestQuery isActives(IsActive... value) {
        this.isActives = Arrays.asList(value);
        return this;
    }

    public TrainingTaskRequestQuery isActives(List<IsActive> value) {
        this.isActives = value;
        return this;
    }

    public TrainingTaskRequestQuery status(TrainingTaskRequestStatus value) {
        this.status = List.of(value);
        return this;
    }

    public TrainingTaskRequestQuery status(TrainingTaskRequestStatus... value) {
        this.status = Arrays.asList(value);
        return this;
    }

    public TrainingTaskRequestQuery status(List<TrainingTaskRequestStatus> value) {
        this.status = value;
        return this;
    }

    public TrainingTaskRequestQuery jobName(String value) {
        this.jobName = List.of(value);
        return this;
    }

    public TrainingTaskRequestQuery jobName(String... value) {
        this.jobName = Arrays.asList(value);
        return this;
    }

    public TrainingTaskRequestQuery jobName(List<String> value) {
        this.jobName = value;
        return this;
    }

    public TrainingTaskRequestQuery ordering(Ordering ordering) {
        this.setOrder(ordering);
        return this;
    }

    @Override
    protected Boolean isFalseQuery() {
//        return this.isEmpty(this.ids) || this.isEmpty(this.isActives) || this.isEmpty(this.status);
        return false;
    }

    @Override
    protected Class<TrainingTaskRequestEntity> entityClass() {
        return TrainingTaskRequestEntity.class;
    }

    @Override
    protected <X, Y> Predicate applyFilters(QueryContext<X, Y> queryContext) {
        List<Predicate> predicates = new ArrayList<>();
        if (this.ids != null) {
            CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(TrainingTaskRequestEntity._id));
            for (UUID item : this.ids) inClause.value(item);
            predicates.add(inClause);
        }
        if (this.isActives != null) {
            CriteriaBuilder.In<IsActive> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(TrainingTaskRequestEntity._isActive));
            for (IsActive item : this.isActives) inClause.value(item);
            predicates.add(inClause);
        }
        if (this.status != null) {
            CriteriaBuilder.In<TrainingTaskRequestStatus> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(TrainingTaskRequestEntity._status));
            for (TrainingTaskRequestStatus item : this.status) inClause.value(item);
            predicates.add(inClause);
        }
        if (this.jobName != null) {
            CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(TrainingTaskRequestEntity._jobName));
            for (String item : this.jobName) inClause.value(item);
            predicates.add(inClause);
        }

        if (predicates.size() > 0) {
            Predicate[] predicatesArray = predicates.toArray(new Predicate[0]);
            return queryContext.CriteriaBuilder.and(predicatesArray);
        } else {
            return null;
        }
    }

    @Override
    protected String fieldNameOf(FieldResolver item) {
        if (item.match(TrainingTaskRequestEntity._id)) return TrainingTaskRequestEntity._id;
        else if (item.match(TrainingTaskRequestEntity._creatorId)) return TrainingTaskRequestEntity._creatorId;
        else if (item.match(TrainingTaskRequestEntity._jobId)) return TrainingTaskRequestEntity._jobId;
        else if (item.match(TrainingTaskRequestEntity._jobName)) return TrainingTaskRequestEntity._jobName;
        else if (item.match(TrainingTaskRequestEntity._config)) return TrainingTaskRequestEntity._config;
        else if (item.match(TrainingTaskRequestEntity._creatorId)) return TrainingTaskRequestEntity._creatorId;
        else if (item.match(TrainingTaskRequestEntity._status)) return TrainingTaskRequestEntity._status;
        else if (item.match(TrainingTaskRequestEntity._isActive)) return TrainingTaskRequestEntity._isActive;
        else if (item.match(TrainingTaskRequestEntity._createdAt)) return TrainingTaskRequestEntity._createdAt;
        else if (item.match(TrainingTaskRequestEntity._startedAt)) return TrainingTaskRequestEntity._startedAt;
        else if (item.match(TrainingTaskRequestEntity._finishedAt)) return TrainingTaskRequestEntity._finishedAt;
        else if (item.match(TrainingTaskRequestEntity._canceledAt)) return TrainingTaskRequestEntity._canceledAt;
        else return null;
    }

    @Override
    protected TrainingTaskRequestEntity convert(Tuple tuple, Set<String> columns) {
        TrainingTaskRequestEntity item = new TrainingTaskRequestEntity();
        item.setId(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._id, UUID.class));
        item.setCreatorId(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._creatorId, UUID.class));
        item.setJobId(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._jobId, String.class));
        item.setJobName(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._jobName, String.class));
        item.setConfig(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._config, String.class));
        item.setStatus(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._status, TrainingTaskRequestStatus.class));
        item.setIsActive(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._isActive, IsActive.class));
        item.setCreatedAt(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._createdAt, Instant.class));
        item.setStartedAt(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._startedAt, Instant.class));
        item.setFinishedAt(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._finishedAt, Instant.class));
        item.setCanceledAt(QueryBase.convertSafe(tuple, columns, TrainingTaskRequestEntity._canceledAt, Instant.class));
        return item;
    }
}


