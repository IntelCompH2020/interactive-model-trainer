package gr.cite.intelcomp.interactivemodeltrainer.data.topic;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TopicEntity {

    private Integer id;
    public static final String _id = "id";
    private String size;
    public static final String _size = "size";

    private String label;
    public static final String _label = "label";

    private String wordDescription;
    public static final String _wordDescription = "wordDescription";

    private String docsActive;
    public static final String _docsActive = "docsActive";

    private String topicEntropy;
    public static final String _topicEntropy = "topicEntropy";

    private String topicCoherence;
    public static final String _topicCoherence = "topicCoherence";

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @JsonProperty("Size")
    public String getSize() {
        return size;
    }

    public Double getSizeNumber() {
        return Double.parseDouble(size);
    }

    @JsonProperty("Size")
    public void setSize(String size) {
        this.size = size;
    }

    @JsonProperty("Label")
    public String getLabel() {
        return label;
    }

    @JsonProperty("Label")
    public void setLabel(String label) {
        this.label = label;
    }

    @JsonProperty("Word Description")
    public String getWordDescription() {
        return wordDescription;
    }

    @JsonProperty("Word Description")
    public void setWordDescription(String wordDescription) {
        this.wordDescription = wordDescription;
    }

    @JsonProperty("Ndocs Active")
    public String getDocsActive() {
        return docsActive;
    }

    public Integer getDocsActiveNumber() {
        return Integer.parseInt(docsActive);
    }

    @JsonProperty("Ndocs Active")
    public void setDocsActive(String docsActive) {
        this.docsActive = docsActive;
    }

    @JsonProperty("Topics entropy")
    public String getTopicEntropy() {
        return topicEntropy;
    }

    public Double getTopicEntropyNumber() {
        return Double.parseDouble(topicEntropy);
    }

    @JsonProperty("Topics entropy")
    public void setTopicEntropy(String topicEntropy) {
        this.topicEntropy = topicEntropy;
    }

    @JsonProperty("Topics coherence")
    public String getTopicCoherence() {
        return topicCoherence;
    }

    public Double getTopicCoherenceNumber() {
        return Double.parseDouble(topicCoherence);
    }

    @JsonProperty("Topics coherence")
    public void setTopicCoherence(String topicCoherence) {
        this.topicCoherence = topicCoherence;
    }
}
