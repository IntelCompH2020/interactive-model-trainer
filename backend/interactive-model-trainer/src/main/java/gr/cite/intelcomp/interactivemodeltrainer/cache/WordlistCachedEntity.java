package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;

import static gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType.WORDLIST_GET;

public class WordlistCachedEntity extends CachedEntity<WordListEntity>{
    public static final String CODE = WORDLIST_GET.name();
    @Override
    public String getCode() {
        return CODE;
    }
}
