package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.rundomaintraining;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.TrainingScheduledEventData;

import java.util.UUID;

public class RunDomainTrainingScheduledEventData extends TrainingScheduledEventData {

    @JsonCreator
    public RunDomainTrainingScheduledEventData(
            @JsonProperty("trainingTaskRequestId") UUID trainingTaskRequestId
    ) {
        super(trainingTaskRequestId);
    }

}
