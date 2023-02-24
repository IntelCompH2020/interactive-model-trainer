package gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidTrainingParameter;
import gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidTrainingParameters;

import java.util.HashMap;

@ValidTrainingParameters()
public class TrainingTaskRequestPersist {

    private String name, parentName, description, visibility, corpusId, type, htm;

    private Integer topicId;

    private Double thr;

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

    public String getHtm() {
        return htm;
    }

    public void setHtm(String htm) {
        this.htm = htm;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }

    public Double getThr() {
        return thr;
    }

    public void setThr(Double thr) {
        this.thr = thr;
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

}
