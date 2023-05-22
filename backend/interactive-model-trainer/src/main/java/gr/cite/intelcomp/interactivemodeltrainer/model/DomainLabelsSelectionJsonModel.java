package gr.cite.intelcomp.interactivemodeltrainer.model;

import java.util.Map;

public class DomainLabelsSelectionJsonModel {

    private Map<String, Integer> labels;

    public Map<String, Integer> getLabels() {
        return labels;
    }

    public void setLabels(Map<String, Integer> labels) {
        this.labels = labels;
    }
}
