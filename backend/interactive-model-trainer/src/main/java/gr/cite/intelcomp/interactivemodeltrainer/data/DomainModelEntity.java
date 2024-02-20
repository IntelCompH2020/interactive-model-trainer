package gr.cite.intelcomp.interactivemodeltrainer.data;

public class DomainModelEntity extends ModelEntity {

    private String corpus;

    public static final String _corpus = "TrDtSet";

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
