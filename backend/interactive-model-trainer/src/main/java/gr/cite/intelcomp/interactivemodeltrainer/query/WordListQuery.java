package gr.cite.intelcomp.interactivemodeltrainer.query;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.WordlistType;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
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
public class WordListQuery extends QueryBase<WordListEntity> {

    private String like;
    private Collection<UUID> ids;
    private Collection<Visibility> visibilities;

    public WordListQuery like(String value) {
        this.like = value;
        return this;
    }

    public WordListQuery ids(Collection<UUID> values) {
        this.ids = values;
        return this;
    }

    public WordListQuery visibilities(Collection<Visibility> values) {
        this.visibilities = values;
        return this;
    }

    @Override
    protected Boolean isFalseQuery() {
        return false;
    }

    @Override
    protected Class<WordListEntity> entityClass() {
        return WordListEntity.class;
    }

    @Override
    protected <X, Y> Predicate applyFilters(QueryContext<X, Y> queryContext) {
        List<Predicate> predicates = new ArrayList<>();
        if (this.ids != null) {
            CriteriaBuilder.In<UUID> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(WordListEntity._id));
            for (UUID item : this.ids) inClause.value(item);
            predicates.add(inClause);
        }
        if (this.like != null && !this.like.isEmpty()) {
            predicates.add(queryContext.CriteriaBuilder.or(queryContext.CriteriaBuilder.like(queryContext.Root.get(WordListEntity._name), this.like),
                    queryContext.CriteriaBuilder.like(queryContext.Root.get(WordListEntity._description), this.like)
            ));
        }
        if (this.visibilities != null) {
            CriteriaBuilder.In<Visibility> inClause = queryContext.CriteriaBuilder.in(queryContext.Root.get(WordListEntity._visibility));
            for (Visibility item : this.visibilities) inClause.value(item);
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
        if (item.match(WordListJson._id)) return WordListEntity._id;
        else if (item.match(WordListJson._name)) return WordListEntity._name;
        else if (item.match(WordListJson._description)) return WordListEntity._description;
        else if (item.match(WordListJson._valid_for)) return WordListEntity._valid_for;
        else if (item.match(WordListJson._visibility)) return WordListEntity._visibility;
        else if (item.match(WordListJson._wordlist)) return WordListEntity._wordlist;
        else return null;
    }

    @Override
    protected WordListEntity convert(Tuple tuple, Set<String> columns) {
        WordListEntity item = new WordListEntity();
        item.setId(QueryBase.convertSafe(tuple, columns, WordListEntity._id, UUID.class));
        item.setName(QueryBase.convertSafe(tuple, columns, WordListEntity._name, String.class));
        item.setDescription(QueryBase.convertSafe(tuple, columns, WordListEntity._description, String.class));
        item.setValid_for(QueryBase.convertSafe(tuple, columns, WordListEntity._valid_for, WordlistType.class));
        item.setVisibility(QueryBase.convertSafe(tuple, columns, WordListEntity._visibility, Visibility.class));
        item.setWordlist(QueryBase.convertSafe(tuple, columns, WordListEntity._wordlist, List.class));
        item.setCreation_date(QueryBase.convertSafe(tuple, columns, WordListEntity._creation_date, Date.class));
        return item;
    }
}
