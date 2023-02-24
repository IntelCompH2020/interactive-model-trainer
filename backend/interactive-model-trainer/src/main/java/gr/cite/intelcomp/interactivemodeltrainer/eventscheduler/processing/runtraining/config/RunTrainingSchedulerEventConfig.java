package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.runtraining.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RunTrainingSchedulerEventProperties.class)
public class RunTrainingSchedulerEventConfig {

    private final RunTrainingSchedulerEventProperties properties;

    public RunTrainingSchedulerEventConfig(RunTrainingSchedulerEventProperties properties) {
        this.properties = properties;
    }

    public RunTrainingSchedulerEventProperties get() {
        return this.properties;
    }

}
