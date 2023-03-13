package gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification;

import java.util.HashMap;

public class DomainClassificationRequestPersist {

    private String name;
    private String description;
    private String visibility;
    private String type;
    private String corpus;
    private String tag;
    private String task;
    private String keywords;
    private HashMap<String, String> params;

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

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCorpus() {
        return corpus;
    }

    public void setCorpus(String corpus) {
        this.corpus = corpus;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}
