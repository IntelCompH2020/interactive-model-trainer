package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.rundomaintraining;

import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.ConsistencyHandler;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunDomainTrainingConsistencyHandler implements ConsistencyHandler<RunDomainTrainingConsistencyPredicates> {
    @Override
    public Boolean isConsistent(RunDomainTrainingConsistencyPredicates consistencyPredicates) {
        return true;
    }
}
