package gr.cite.intelcomp.interactivemodeltrainer.configuration;

public class KubernetesJobConfiguration {

	private String jobName;

	private String containerName;

	public String getJobName() {
		return jobName;
	}

	public void setJobName(String jobName) {
		this.jobName = jobName;
	}

	public String getContainerName() {
		return containerName;
	}

	public void setContainerName(String containerName) {
		this.containerName = containerName;
	}
}
