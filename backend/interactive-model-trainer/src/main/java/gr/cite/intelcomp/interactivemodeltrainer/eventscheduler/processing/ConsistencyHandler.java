package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing;

public interface ConsistencyHandler<T extends ConsistencyPredicates> {
	Boolean isConsistent(T consistencyPredicates);

}
