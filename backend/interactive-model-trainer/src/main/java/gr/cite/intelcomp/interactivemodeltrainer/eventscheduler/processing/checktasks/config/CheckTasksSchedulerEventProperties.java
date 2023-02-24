package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConstructorBinding
@ConfigurationProperties(prefix = "event-scheduler.events.check-tasks")
public class CheckTasksSchedulerEventProperties {

    private final Long checkIntervalInSeconds;

    public CheckTasksSchedulerEventProperties(Long checkIntervalInSeconds) {
        this.checkIntervalInSeconds = checkIntervalInSeconds;
    }

    public Long getCheckIntervalInSeconds() {
        return checkIntervalInSeconds;
    }

}
