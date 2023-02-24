package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;

public class TopicLabelsPayload {

    @NotEmpty
    private ArrayList<String> labels;

    public ArrayList<String> getLabels() {
        return labels;
    }

    public void setLabels(ArrayList<String> labels) {
        this.labels = labels;
    }

}
