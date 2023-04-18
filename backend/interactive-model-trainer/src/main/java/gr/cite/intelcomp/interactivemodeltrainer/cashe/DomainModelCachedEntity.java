package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;

public class DomainModelCachedEntity extends ModelCachedEntity<DomainModelEntity>{
    @Override
    public String getCode() {
        return CommandType.MODEL_GET_DOMAIN.name();
    }
}
