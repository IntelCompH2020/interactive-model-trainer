package gr.cite.intelcomp.interactivemodeltrainer.query.lookup;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.tools.data.query.Lookup;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CorpusLookup extends Lookup {

    private String like;
    private List<Visibility> visibilities;
    private List<UUID> ids;
    private String creator;
    private Boolean mine;
    private Instant createdAt;
    private CorpusType corpusType;
    private CorpusValidFor corpusValidFor;

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
        if (creator != null) return creator.trim();
        return null;
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

    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public CorpusType getCorpusType() {
        return corpusType;
    }
    public void setCorpusType(CorpusType corpusType) {
        this.corpusType = corpusType;
    }

    public CorpusValidFor getCorpusValidFor() {
        return corpusValidFor;
    }
    public void setCorpusValidFor(CorpusValidFor corpusValidFor) {
        this.corpusValidFor = corpusValidFor;
    }
}
