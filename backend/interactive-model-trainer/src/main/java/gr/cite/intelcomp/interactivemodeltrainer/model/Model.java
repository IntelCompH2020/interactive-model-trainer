package gr.cite.intelcomp.interactivemodeltrainer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

public class Model {

    private UUID id;
    public final static String _id = "id";

    private String name;
    public final static String _name = "name";

    private String description;
    public static final String _description = "description";

    private Visibility visibility;
    public final static String _visibility = "visibility";

    private String trainer;
    public static final String _trainer = "trainer";

    private String corpus;
    public static final String _corpus = "corpus";

    private Map<String, Object> params;
    public static final String _params = "params";

    private String creator;
    public static final String _creator = "creator";

    private String location;
    public static final String _location = "location";

    private Date creation_date;
    public final static String _creation_date = "creation_date";

    private Integer hierarchyLevel;
    public static final String _hierarchy_level = "hierarchy_level";

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

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    @JsonProperty("type")
    public String getTrainer() {
        return trainer;
    }

    @JsonProperty("type")
    public void setTrainer(String trainer) {
        this.trainer = trainer;
    }

    @JsonProperty("TrDtSet")
    public String getCorpus() {
        return corpus;
    }

    @JsonProperty("TrDtSet")
    public void setCorpus(String corpus) {
        this.corpus = corpus;
    }

    @JsonProperty("TMparam")
    public Map<String, Object> getParams() {
        return params;
    }

    @JsonProperty("TMparam")
    public void setParams(Map<String, Object> params) {
        this.params = params;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Date getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }

    public Integer getHierarchyLevel() {
        return hierarchyLevel;
    }

    public void setHierarchyLevel(Integer hierarchyLevel) {
        this.hierarchyLevel = hierarchyLevel;
    }
}
