package gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidByHierarchical;
import gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidTrainingParameters;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;

@ValidTrainingParameters()
@ValidByHierarchical()
public class TrainingTaskRequestPersist {

    @NotBlank
    private String name;
    private String parentName, description, visibility, corpusId, type;
    private Integer topicId;
    @NotNull
    private Boolean hierarchical;

    private HashMap<String, String> parameters = new HashMap<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getCorpusId() {
        return corpusId;
    }

    public void setCorpusId(String corpusId) {
        this.corpusId = corpusId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }

    @JsonAnyGetter()
    public HashMap<String, String> getParameters() {
        return parameters;
    }

    @JsonAnySetter()
    public void addParameter(String name, String value) {
        this.parameters.put(name, value);
    }

    public void setParameters(HashMap<String, String> parameters) {
        this.parameters = parameters;
    }

    public Boolean getHierarchical() {
        return hierarchical;
    }

    public void setHierarchical(Boolean hierarchical) {
        this.hierarchical = hierarchical;
    }
}
