package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CheckTasksSchedulerEventProperties.class)
public class CheckTasksSchedulerEventConfig {

    private final CheckTasksSchedulerEventProperties properties;

    public CheckTasksSchedulerEventConfig(CheckTasksSchedulerEventProperties properties) {
        this.properties = properties;
    }

    public CheckTasksSchedulerEventProperties get() {
        return this.properties;
    }

}
