package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties(prefix = "event-scheduler")
public class EventSchedulerProperties {

	private final Task task;

	@ConstructorBinding
	public EventSchedulerProperties(Task task) {
		this.task = task;
	}

	public Task getTask() {
		return task;
	}

	public static class Task {

		private final String name;
		private final Processor processor;

		public Task(String name, Processor processor) {
			this.name = name;
			this.processor = processor;
		}

		public String getName() {
			return name;
		}

		public Processor getProcessor() {
			return processor;
		}

		public static class Processor {
			private final Boolean enable;
			private final Long intervalSeconds;
			private final Options options;

			public Processor(Boolean enable, Long intervalSeconds, Options options) {
				this.enable = enable;
				this.intervalSeconds = intervalSeconds;
				this.options = options;
			}

			public Boolean getEnable() {
				return enable;
			}

			public Long getIntervalSeconds() {
				return intervalSeconds;
			}

			public Options getOptions() {
				return options;
			}


			public static class Options {
				private final Long retryThreshold;
				private final Long maxRetryDelaySeconds;
				private final Long tooOldToHandleSeconds;

				public Options(Long retryThreshold, Long maxRetryDelaySeconds, Long tooOldToHandleSeconds, Long parallelTasksThreshold) {
					this.retryThreshold = retryThreshold;
					this.maxRetryDelaySeconds = maxRetryDelaySeconds;
					this.tooOldToHandleSeconds = tooOldToHandleSeconds;
				}

				public Long getRetryThreshold() {
					return retryThreshold;
				}

				public Long getMaxRetryDelaySeconds() {
					return maxRetryDelaySeconds;
				}

				public Long getTooOldToHandleSeconds() {
					return tooOldToHandleSeconds;
				}

			}
		}
	}
}
