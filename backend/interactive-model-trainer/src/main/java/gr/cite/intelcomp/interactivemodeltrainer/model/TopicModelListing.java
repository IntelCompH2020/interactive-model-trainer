package gr.cite.intelcomp.interactivemodeltrainer.model;

import java.util.List;

public class TopicModelListing extends TopicModel {

    public static final String _submodels = "submodels";

    private List<TopicModel> submodels;

    public List<TopicModel> getSubmodels() {
        return submodels;
    }

    public void setSubmodels(List<TopicModel> submodels) {
        this.submodels = submodels;
    }

}
