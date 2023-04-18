package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;

import static gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType.WORDLIST_GET;

public class WordlistCachedEntity extends CachedEntity<WordListEntity>{
    @Override
    public String getCode() {
        return WORDLIST_GET.name();
    }
}
