package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.topicmodeltasks;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class TopicModelTaskScheduledEventData {

    private final UUID requestId;
    private final String modelName;

    @JsonCreator
    public TopicModelTaskScheduledEventData(
            @JsonProperty("requestId") UUID requestId,
            @JsonProperty("modelName") String modelName
    ) {
        this.requestId = requestId;
        this.modelName = modelName;
    }

    public UUID getRequestId() {
        return requestId;
    }

    public String getModelName() {
        return modelName;
    }
}
