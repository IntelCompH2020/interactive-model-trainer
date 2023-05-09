package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;

public class TopicCachedEntity extends CachedEntity<TopicEntity> {
    public static final String CODE = CommandType.TOPIC_GET.name();
    @Override
    public String getCode() {
        return CODE;
    }
}
