package gr.cite.intelcomp.interactivemodeltrainer.common.enums;

public enum ScheduledEventType {

	//-TOPIC MODELS ----------------------------------------
	RUN_ROOT_TOPIC_TRAINING, PREPARE_HIERARCHICAL_TOPIC_TRAINING, RUN_HIERARCHICAL_TOPIC_TRAINING,
	RESET_TOPIC_MODEL, FUSE_TOPIC_MODEL, SORT_TOPIC_MODEL,

	//-DOMAIN MODELS ---------------------------------------
	RUN_ROOT_DOMAIN_TRAINING,
	RETRAIN_DOMAIN_MODEL, CLASSIFY_DOMAIN_MODEL, EVALUATE_DOMAIN_MODEL,

	//Other
	CHECK_RUNNING_TASKS
}
