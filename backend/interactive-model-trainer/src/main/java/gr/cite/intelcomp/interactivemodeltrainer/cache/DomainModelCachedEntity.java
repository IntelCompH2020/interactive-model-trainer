package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;

public class DomainModelCachedEntity extends ModelCachedEntity<DomainModelEntity>{

    public static final String CODE = CommandType.MODEL_GET_DOMAIN.name();

    @Override
    public String getCode() {
        return CODE;
    }
}
