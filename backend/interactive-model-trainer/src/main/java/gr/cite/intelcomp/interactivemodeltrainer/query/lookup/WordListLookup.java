package gr.cite.intelcomp.interactivemodeltrainer.query.lookup;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.query.WordListQuery;
import gr.cite.tools.data.query.Lookup;
import gr.cite.tools.data.query.QueryFactory;

import java.util.List;
import java.util.UUID;

public class WordListLookup extends Lookup {

    private String like;
    private List<Visibility> visibilities;
    private List<UUID> ids;

    private String creator;

    private Boolean mine;

    public String getLike() {
        return like;
    }
    public void setLike(String like) {
        this.like = like.trim().toLowerCase();
    }

    public List<Visibility> getVisibilities() {
        return visibilities;
    }
    public void setVisibilities(List<Visibility> visibilities) {
        this.visibilities = visibilities;
    }

    public List<UUID> getIds() {
        return ids;
    }
    public void setIds(List<UUID> ids) {
        this.ids = ids;
    }

    public String getCreator() {
        return creator;
    }
    public void setCreator(String creator) {
        this.creator = creator;
    }

    public Boolean getMine() {
        return mine;
    }
    public void setMine(Boolean mine) {
        this.mine = mine;
    }

    public WordListQuery enrich(QueryFactory queryFactory) {
        WordListQuery query = queryFactory.query(WordListQuery.class);
        if (this.like != null) query.like(this.like);
        if (this.visibilities != null) query.visibilities(this.visibilities);
        if (this.ids != null) query.ids(this.ids);

        this.enrichCommon(query);

        return query;
    }

}
