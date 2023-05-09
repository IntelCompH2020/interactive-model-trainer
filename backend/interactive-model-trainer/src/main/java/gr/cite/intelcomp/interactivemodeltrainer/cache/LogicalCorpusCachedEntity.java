package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;

public class LogicalCorpusCachedEntity extends CorpusCachedEntity<LogicalCorpusEntity>{

    public static final String CODE = CommandType.CORPUS_GET_LOGICAL.name();

    @Override
    public String getCode() {
        return CODE;
    }
}
