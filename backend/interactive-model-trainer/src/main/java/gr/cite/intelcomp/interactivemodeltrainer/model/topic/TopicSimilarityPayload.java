package gr.cite.intelcomp.interactivemodeltrainer.model.topic;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

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
