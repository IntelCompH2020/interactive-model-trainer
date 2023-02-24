package gr.cite.intelcomp.interactivemodeltrainer.query.lookup;

import gr.cite.tools.data.query.Lookup;

public class TopicLookup extends Lookup {

    private String like;

    private String wordDescription;

    public String getLike() {
        return like;
    }

    public void setLike(String like) {
        this.like = like;
    }

    public String getWordDescription() {
        return wordDescription;
    }

    public void setWordDescription(String wordDescription) {
        this.wordDescription = wordDescription;
    }
}
