package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.RawCorpusEntity;

public class RawCorpusCachedEntity extends CorpusCachedEntity<RawCorpusEntity>{

    public static final String CODE = CommandType.CORPUS_GET_RAW.name();

    @Override
    public String getCode() {
        return CODE;
    }
}
