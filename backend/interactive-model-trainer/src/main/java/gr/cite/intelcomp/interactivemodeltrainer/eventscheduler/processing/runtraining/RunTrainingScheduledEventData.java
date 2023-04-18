package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.TrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;

import java.util.UUID;

public class RunTrainingScheduledEventData extends TrainingScheduledEventData {

    private final TrainingTaskRequestPersist request;

    @JsonCreator
    public RunTrainingScheduledEventData(
            @JsonProperty("trainingTaskRequestId") UUID trainingTaskRequestId,
            @JsonProperty("request") TrainingTaskRequestPersist request) {
        super(trainingTaskRequestId);
        this.request = request;
    }

    public TrainingTaskRequestPersist getRequest() {
        return request;
    }
}
