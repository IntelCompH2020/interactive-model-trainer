package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;

public class TopicFusionPayload {

    @NotNull
    @NotEmpty
    ArrayList<Integer> topics;

    public ArrayList<Integer> getTopics() {
        return topics;
    }

    public void setTopics(ArrayList<Integer> topics) {
        this.topics = topics;
    }
}
