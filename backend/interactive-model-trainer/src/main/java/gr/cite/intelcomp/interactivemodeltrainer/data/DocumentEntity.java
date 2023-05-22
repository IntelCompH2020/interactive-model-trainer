package gr.cite.intelcomp.interactivemodeltrainer.data;

public class DocumentEntity {

    private Integer index, label, prediction;
    private String id, text;

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public Integer getLabel() {
        return label;
    }

    public void setLabel(Integer label) {
        this.label = label;
    }

    public Integer getPrediction() {
        return prediction;
    }

    public void setPrediction(Integer prediction) {
        this.prediction = prediction;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
