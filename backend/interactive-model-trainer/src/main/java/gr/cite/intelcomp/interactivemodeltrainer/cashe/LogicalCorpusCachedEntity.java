package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;

public class LogicalCorpusCachedEntity extends CorpusCachedEntity<LogicalCorpusEntity>{
    @Override
    public String getCode() {
        return CommandType.CORPUS_GET_LOGICAL.name();
    }
}
