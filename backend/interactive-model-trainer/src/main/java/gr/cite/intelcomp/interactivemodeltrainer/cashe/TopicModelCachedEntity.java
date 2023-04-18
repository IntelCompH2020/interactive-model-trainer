package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelEntity;

public class TopicModelCachedEntity extends ModelCachedEntity<TopicModelEntity> {
    @Override
    public String getCode() {
        return CommandType.MODEL_GET_TOPIC.name();
    }
}
