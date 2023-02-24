package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler;

import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.task.EventSchedulerTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(EventSchedulerProperties.class)
public class EventSchedulerConfig {

	private final ApplicationContext applicationContext;
	private final EventSchedulerProperties properties;

	@Autowired
	public EventSchedulerConfig(ApplicationContext applicationContext, EventSchedulerProperties properties) {
		this.applicationContext = applicationContext;
		this.properties = properties;
	}

	@Bean
	@ConditionalOnProperty(name = "event-scheduler.task.processor.enable", havingValue = "true")
	public EventSchedulerTask notificationScheduleTask() {
		return new EventSchedulerTask(this.applicationContext, this.properties);
	}
}
