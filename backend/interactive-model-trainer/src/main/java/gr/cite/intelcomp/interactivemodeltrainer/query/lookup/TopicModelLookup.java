package gr.cite.intelcomp.interactivemodeltrainer.query.lookup;

public class TopicModelLookup extends ModelLookup{

    private String trainer;

    private Integer hierarchyLevel;

    public String getTrainer() {
        return trainer;
    }

    public void setTrainer(String trainer) {
        this.trainer = trainer;
    }

    public Integer getHierarchyLevel() {
        return hierarchyLevel;
    }

    public void setHierarchyLevel(Integer hierarchyLevel) {
        this.hierarchyLevel = hierarchyLevel;
    }
}
