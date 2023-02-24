package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.TrainingScheduledEventData;

import java.util.UUID;

public class RunTrainingScheduledEventData extends TrainingScheduledEventData {

    private final String corpusId;
    private final String parameters;

    @JsonCreator
    public RunTrainingScheduledEventData(
            @JsonProperty("trainingTaskRequestId") UUID trainingTaskRequestId,
            @JsonProperty("corpusId") String corpusId,
            @JsonProperty("parameters") String parameters) {
        super(trainingTaskRequestId);
        this.corpusId = corpusId;
        this.parameters = parameters;
    }

    public String getCorpusId() {
        return corpusId;
    }

    public String getParameters() {
        return parameters;
    }
}
