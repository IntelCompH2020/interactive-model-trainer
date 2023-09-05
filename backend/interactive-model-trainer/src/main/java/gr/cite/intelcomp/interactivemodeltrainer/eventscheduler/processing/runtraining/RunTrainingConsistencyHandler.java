package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining;

import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.ConsistencyHandler;
import gr.cite.tools.data.query.QueryFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RunTrainingConsistencyHandler implements ConsistencyHandler<RunTrainingConsistencyPredicates> {

    @Autowired
    public RunTrainingConsistencyHandler(QueryFactory queryFactory) {
    }

    @Override
    public Boolean isConsistent(RunTrainingConsistencyPredicates consistencyPredicates) {
        return true;
    }
}
