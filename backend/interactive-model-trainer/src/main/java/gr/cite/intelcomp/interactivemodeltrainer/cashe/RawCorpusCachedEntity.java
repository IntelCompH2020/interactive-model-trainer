package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.RawCorpusEntity;

public class RawCorpusCachedEntity extends CorpusCachedEntity<RawCorpusEntity>{
    @Override
    public String getCode() {
        return CommandType.CORPUS_GET_RAW.name();
    }
}
