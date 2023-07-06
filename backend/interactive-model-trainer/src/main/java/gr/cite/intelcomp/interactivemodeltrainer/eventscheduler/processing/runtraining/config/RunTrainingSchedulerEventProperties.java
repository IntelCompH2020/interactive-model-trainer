package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties(prefix = "event-scheduler.events.run-training")
public class RunTrainingSchedulerEventProperties {

    private final Long parallelTrainingsThreshold;
    private final Long postponePeriodInSeconds;

    @ConstructorBinding
    public RunTrainingSchedulerEventProperties(Long parallelTrainingsThreshold, Long postponePeriodInSeconds) {
        this.parallelTrainingsThreshold = parallelTrainingsThreshold;
        this.postponePeriodInSeconds = postponePeriodInSeconds;
    }

    public Long getParallelTrainingsThreshold() {
        return parallelTrainingsThreshold;
    }

    public Long getPostponePeriodInSeconds() {
        return postponePeriodInSeconds;
    }
}
