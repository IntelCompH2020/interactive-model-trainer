package gr.cite.intelcomp.interactivemodeltrainer.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import jakarta.persistence.MappedSuperclass;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@MappedSuperclass
public class ModelEntity {

    private UUID id;

    public final static String _id = "id";

    private String name;

    public final static String _name = "name";

    private String description;

    public static final String _description = "description";

    private Visibility visibility;

    public final static String _visibility = "visibility";

    private String trainer;

    public static final String _trainer = "type";

    private Map<String, Object> params;

    public static final String _params = "params";

    private String creator;

    public static final String _creator = "creator";

    private String location;

    public static final String _location = "location";

    private Date creation_date;

    public final static String _creation_date = "creation_date";

    private Integer hierarchyLevel;

    public static final String _hierarchy_level = "hierarchyLevel";

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

    public String getTrainer() {
        return trainer;
    }

    public void setTrainer(String trainer) {
        this.trainer = trainer;
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
        if (creator != null)
            return creator.trim();
        return null;
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

    @JsonProperty("creation_date")
    public Date getCreation_date() {
        return creation_date;
    }

    @JsonProperty("creation_date")
    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }

    public long getCreationMilliseconds() {
        return creation_date.toInstant().toEpochMilli();
    }

    @JsonProperty("hierarchy-level")
    public Integer getHierarchyLevel() {
        return hierarchyLevel;
    }

    @JsonProperty("hierarchy-level")
    public void setHierarchyLevel(Integer hierarchyLevel) {
        this.hierarchyLevel = hierarchyLevel;
    }
}
