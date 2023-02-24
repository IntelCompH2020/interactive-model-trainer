package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;
public class TrainingScheduledEventData {

    private final UUID trainingTaskRequestId;

    @JsonCreator
    public TrainingScheduledEventData(
            @JsonProperty("trainingTaskRequestId") UUID trainingTaskRequestId) {
        this.trainingTaskRequestId = trainingTaskRequestId;
    }

    public UUID getTrainingTaskRequestId() {
        return trainingTaskRequestId;
    }

}
