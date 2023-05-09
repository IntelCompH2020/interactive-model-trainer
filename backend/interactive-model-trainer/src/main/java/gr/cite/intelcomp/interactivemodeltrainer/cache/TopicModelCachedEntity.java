package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelEntity;

public class TopicModelCachedEntity extends ModelCachedEntity<TopicModelEntity> {

    public static final String CODE = CommandType.MODEL_GET_TOPIC.name();

    @Override
    public String getCode() {
        return CODE;
    }
}
