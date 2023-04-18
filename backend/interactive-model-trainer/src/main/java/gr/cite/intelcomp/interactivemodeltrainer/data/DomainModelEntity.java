package gr.cite.intelcomp.interactivemodeltrainer.data;

import javax.persistence.Column;

public class DomainModelEntity extends ModelEntity{

    @Column(name = "corpus")
    private String corpus;
    public static final String _corpus = "TrDtSet";

    @Column(name = "tag")
    private String tag;
    public static final String _tag = "tag";

    public String getCorpus() {
        return corpus;
    }

    public void setCorpus(String corpus) {
        this.corpus = corpus;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}
