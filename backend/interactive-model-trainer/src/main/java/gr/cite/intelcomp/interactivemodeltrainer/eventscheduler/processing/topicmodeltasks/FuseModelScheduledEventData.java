package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.UUID;

public class FuseModelScheduledEventData extends TopicModelTaskScheduledEventData {

    private final ArrayList<Integer> topics;

    @JsonCreator
    public FuseModelScheduledEventData(
            @JsonProperty("requestId") UUID requestId,
            @JsonProperty("modelName") String modelName,
            @JsonProperty("topics") ArrayList<Integer> topics) {
        super(requestId, modelName);
        this.topics = topics;
    }

    public ArrayList<Integer> getTopics() {
        return topics;
    }
}
