package gr.cite.intelcomp.interactivemodeltrainer.data;

import java.util.List;

public class TopicModelListingEntity extends TopicModelEntity {

    public static final String _submodels = "submodels";

    private List<TopicModelEntity> submodels;

    public List<TopicModelEntity> getSubmodels() {
        return submodels;
    }

    public void setSubmodels(List<TopicModelEntity> submodels) {
        this.submodels = submodels;
    }

}
