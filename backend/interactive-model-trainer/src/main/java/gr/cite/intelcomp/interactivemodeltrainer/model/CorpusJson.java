package gr.cite.intelcomp.interactivemodeltrainer.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;

import java.util.Date;
import java.util.UUID;

public class CorpusJson {

    public final static String _id = "id";
    private UUID id;

    public static final String _name = "name";
    private String name;

    public static final String _description = "description";
    private String description;

    public static final String _type = "type";
    private CorpusType type;

    public static final String _visibility = "visibility";
    private Visibility visibility;

    protected CorpusJson(LogicalCorpus corpus) {
        this.setName(corpus.getName());
        this.setDescription(corpus.getDescription());
        this.setVisibility(corpus.getVisibility());
        this.setType(CorpusType.LOGICAL);
    }

    protected CorpusJson(RawCorpus corpus) {
        this.setName(corpus.getName());
        this.setDescription(corpus.getDescription());
        this.setVisibility(corpus.getVisibility());
        this.setType(CorpusType.RAW);
    }

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public CorpusType getType() {
        return type;
    }

    public void setType(CorpusType type) {
        this.type = type;
    }

    public Visibility getVisibility() {
        return visibility;
    }
    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

}
