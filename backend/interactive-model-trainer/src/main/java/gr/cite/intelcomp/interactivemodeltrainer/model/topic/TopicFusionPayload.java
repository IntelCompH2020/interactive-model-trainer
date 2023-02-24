package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
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
