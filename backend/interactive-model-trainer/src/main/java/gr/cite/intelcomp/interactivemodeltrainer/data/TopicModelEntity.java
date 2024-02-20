package gr.cite.intelcomp.interactivemodeltrainer.data;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TopicModelEntity extends ModelEntity {

    private String corpus;

    public static final String _corpus = "TrDtSet";

    @JsonProperty("TrDtSet")
    public String getCorpus() {
        return corpus;
    }

    @JsonProperty("TrDtSet")
    public void setCorpus(String corpus) {
        this.corpus = corpus;
    }

}
