package gr.cite.intelcomp.interactivemodeltrainer.query;

import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.tools.data.query.FieldResolver;
import gr.cite.tools.data.query.QueryBase;
import gr.cite.tools.data.query.QueryContext;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import java.util.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class UserQuery extends QueryBase<UserEntity> {

    private Collection<UUID> ids, subjectIds;

    private Collection<String> userNames;

    public UserQuery ids(UUID value) {
        this.ids = List.of(value);
        return this;
    }

    public UserQuery ids(UUID... value) {
        this.ids = Arrays.asList(value);
        return this;
    }

    public UserQuery ids(List<UUID> value) {
        this.ids = value;
        return this;
    }

    public UserQuery subjectIds(UUID value) {
        this.subjectIds = List.of(value);
        return this;
    }

    public UserQuery subjectIds(UUID... value) {
        this.subjectIds = Arrays.asList(value);
        return this;
    }

    public UserQuery subjectIds(List<UUID> value) {
        this.subjectIds = value;
        return this;
    }

    public UserQuery usernames(String value) {
        this.userNames = List.of(value);
        return this;
    }

    public UserQuery usernames(String... value) {
        this.userNames = Arrays.asList(value);
        return this;
    }

    public UserQuery usernames(List<String> value) {
        this.userNames = value;
        return this;
    }

    @Override
    protected Boolean isFalseQuery() {
        return false;
    }

    @Override
    protected Class<UserEntity> entityClass() {
        return UserEntity.class;
    }

    @Override
    protected <X, Y> Predicate applyFilters(QueryContext<X, Y> queryContext) {
        List<Predicate> predicates = new ArrayList<>();

        if (this.ids != null) {
            CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(UserEntity._id));
            for (UUID item : this.ids) inClause.value(item);
            predicates.add(inClause);
        }

        if (this.userNames != null) {
            CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(UserEntity._firstName));
            for (String item : this.userNames) inClause.value(item);
            predicates.add(inClause);
        }

        if (this.subjectIds != null) {
            CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(UserEntity._subjectId));
            for (UUID item : this.subjectIds) inClause.value(item);
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
        return null;
    }

    @Override
    protected UserEntity convert(Tuple tuple, Set<String> columns) {
        return null;
    }
}
