package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checktasks.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConstructorBinding
@ConfigurationProperties(prefix = "event-scheduler.events.check-tasks")
public class CheckTasksSchedulerEventProperties {

    private final Long checkIntervalInSeconds;
    private final CacheOptions cacheOptions;

    public CheckTasksSchedulerEventProperties(Long checkIntervalInSeconds, CacheOptions cacheOptions) {
        this.checkIntervalInSeconds = checkIntervalInSeconds;
        this.cacheOptions = cacheOptions;
    }

    public Long getCheckIntervalInSeconds() {
        return checkIntervalInSeconds;
    }

    public CacheOptions getCacheOptions() {
        return cacheOptions;
    }

    public static class CacheOptions {

        private final Integer taskResponseCacheRetentionInHours;

        public CacheOptions(Integer taskResponseCacheRetentionInHours) {
            this.taskResponseCacheRetentionInHours = taskResponseCacheRetentionInHours;
        }

        public Integer getTaskResponseCacheRetentionInHours() {
            return taskResponseCacheRetentionInHours;
        }
    }

}
