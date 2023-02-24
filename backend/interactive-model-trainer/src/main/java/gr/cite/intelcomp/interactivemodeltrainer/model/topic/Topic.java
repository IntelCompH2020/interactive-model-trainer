package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

public class Topic {

    private Integer id;
    private String size;
    private String label;
    private String wordDescription;
    private String docsActive;
    private String topicEntropy;
    private String topicCoherence;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getWordDescription() {
        return wordDescription;
    }

    public void setWordDescription(String wordDescription) {
        this.wordDescription = wordDescription;
    }

    public String getDocsActive() {
        return docsActive;
    }

    public void setDocsActive(String docsActive) {
        this.docsActive = docsActive;
    }

    public String getTopicEntropy() {
        return topicEntropy;
    }

    public void setTopicEntropy(String topicEntropy) {
        this.topicEntropy = topicEntropy;
    }

    public String getTopicCoherence() {
        return topicCoherence;
    }

    public void setTopicCoherence(String topicCoherence) {
        this.topicCoherence = topicCoherence;
    }
}
