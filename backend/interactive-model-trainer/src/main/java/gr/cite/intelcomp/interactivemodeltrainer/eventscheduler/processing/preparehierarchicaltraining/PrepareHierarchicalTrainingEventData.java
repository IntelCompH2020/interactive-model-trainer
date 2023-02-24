package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.preparehierarchicaltraining;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.TrainingScheduledEventData;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;

import java.util.UUID;

public class PrepareHierarchicalTrainingEventData extends TrainingScheduledEventData {

    private final TrainingTaskRequestPersist request;
    private final UUID userId;

    @JsonCreator
    public PrepareHierarchicalTrainingEventData(
            @JsonProperty("trainingTaskRequestId") UUID trainingTaskRequestId,
            @JsonProperty("request") TrainingTaskRequestPersist request,
            @JsonProperty("userId") UUID userId) {
        super(trainingTaskRequestId);
        this.request = request;
        this.userId = userId;
    }

    public TrainingTaskRequestPersist getRequest() {
        return request;
    }

    public UUID getUserId() {
        return userId;
    }
}
