package gr.cite.intelcomp.interactivemodeltrainer.query;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusImportStatus;
import gr.cite.intelcomp.interactivemodeltrainer.data.CorpusImportEntity;
import gr.cite.tools.data.query.FieldResolver;
import gr.cite.tools.data.query.QueryBase;
import gr.cite.tools.data.query.QueryContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class CorpusImportQuery extends QueryBase<CorpusImportEntity> {

    private Collection<UUID> ids;

    private Collection<String> names, paths;

    private Collection<CorpusImportStatus> statuses;

    public CorpusImportQuery ids(UUID value) {
        this.ids = List.of(value);
        return this;
    }

    public CorpusImportQuery ids(UUID... value) {
        this.ids = Arrays.asList(value);
        return this;
    }

    public CorpusImportQuery ids(List<UUID> value) {
        this.ids = value;
        return this;
    }

    public CorpusImportQuery names(String value) {
        this.names = List.of(value);
        return this;
    }

    public CorpusImportQuery names(String... value) {
        this.names = Arrays.asList(value);
        return this;
    }

    public CorpusImportQuery names(List<String> value) {
        this.names = value;
        return this;
    }

    public CorpusImportQuery paths(String value) {
        this.paths = List.of(value);
        return this;
    }

    public CorpusImportQuery paths(String... value) {
        this.paths = Arrays.asList(value);
        return this;
    }

    public CorpusImportQuery paths(List<String> value) {
        this.paths = value;
        return this;
    }

    public CorpusImportQuery statuses(CorpusImportStatus value) {
        this.statuses = List.of(value);
        return this;
    }

    public CorpusImportQuery statuses(CorpusImportStatus... value) {
        this.statuses = Arrays.asList(value);
        return this;
    }

    public CorpusImportQuery statuses(List<CorpusImportStatus> value) {
        this.statuses = value;
        return this;
    }

    @Override
    protected Boolean isFalseQuery() {
        return false;
    }

    @Override
    protected Class<CorpusImportEntity> entityClass() {
        return CorpusImportEntity.class;
    }

    @Override
    protected <X, Y> Predicate applyFilters(QueryContext<X, Y> queryContext) {
        List<Predicate> predicates = new ArrayList<>();

        if (this.ids != null) {
            CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(CorpusImportEntity._id));
            for (UUID item : this.ids) inClause.value(item);
            predicates.add(inClause);
        }

        if (this.names != null) {
            CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(CorpusImportEntity._name));
            for (String item : this.names) inClause.value(item);
            predicates.add(inClause);
        }

        if (this.paths != null) {
            CriteriaBuilder.In<String> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(CorpusImportEntity._path));
            for (String item : this.paths) inClause.value(item);
            predicates.add(inClause);
        }

        if (this.statuses != null) {
            CriteriaBuilder.In<CorpusImportStatus> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(CorpusImportEntity._status));
            for (CorpusImportStatus item : this.statuses) inClause.value(item);
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
    protected CorpusImportEntity convert(Tuple tuple, Set<String> columns) {
        return null;
    }
}
