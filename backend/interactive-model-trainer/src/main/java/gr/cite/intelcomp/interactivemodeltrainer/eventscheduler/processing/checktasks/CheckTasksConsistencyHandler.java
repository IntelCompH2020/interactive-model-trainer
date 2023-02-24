package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.ConsistencyHandler;
import gr.cite.tools.data.query.QueryFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class CheckTasksConsistencyHandler implements ConsistencyHandler<CheckTasksConsistencyPredicates> {

	private final QueryFactory queryFactory;

	public CheckTasksConsistencyHandler(QueryFactory queryFactory) {
		this.queryFactory = queryFactory;
	}

	@Override
	public Boolean isConsistent(CheckTasksConsistencyPredicates consistencyPredicates) {
		return true;
	}
}
