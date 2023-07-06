package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TopicSimilarityPayload {

    @NotNull
    @Min(1)
    private Integer pairs;

    public Integer getPairs() {
        return pairs;
    }

    public void setPairs(Integer pairs) {
        this.pairs = pairs;
    }
}
