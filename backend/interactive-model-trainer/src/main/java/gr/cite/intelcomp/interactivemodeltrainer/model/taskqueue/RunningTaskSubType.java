package gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue;

public enum RunningTaskSubType {

    //Default
    EMPTY,

    //-TOPIC MODELS ----------------------------------------
    RUN_ROOT_TOPIC_TRAINING, RUN_HIERARCHICAL_TOPIC_TRAINING,
    RESET_TOPIC_MODEL, FUSE_TOPIC_MODEL, SORT_TOPIC_MODEL,

    //-DOMAIN MODELS ---------------------------------------
    RUN_ROOT_DOMAIN_TRAINING,
    RETRAIN_DOMAIN_MODEL, CLASSIFY_DOMAIN_MODEL, EVALUATE_DOMAIN_MODEL, SAMPLE_DOMAIN_MODEL, GIVE_FEEDBACK_DOMAIN_MODEL

}
