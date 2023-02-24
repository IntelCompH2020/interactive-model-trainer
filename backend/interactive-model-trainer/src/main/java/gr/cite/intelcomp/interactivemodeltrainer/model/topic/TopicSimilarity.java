package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;

public class TopicSimilarity {

    private ArrayList<ArrayList<Object>> coocurring;
    private ArrayList<ArrayList<Object>> wordDesc;

    @JsonProperty("Coocurring")
    public ArrayList<ArrayList<Object>> getCoocurring() {
        return coocurring;
    }

    @JsonProperty("Coocurring")
    public void setCoocurring(ArrayList<ArrayList<Object>> coocurring) {
        this.coocurring = coocurring;
    }

    @JsonProperty("Worddesc")
    public ArrayList<ArrayList<Object>> getWordDesc() {
        return wordDesc;
    }

    @JsonProperty("Worddesc")
    public void setWordDesc(ArrayList<ArrayList<Object>> wordDesc) {
        this.wordDesc = wordDesc;
    }
}
