package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExecutionParams {
	public ExecutionParams(String jobName, String jobId) {
		this.jobName = jobName;
		this.jobId = jobId;
	}

	private String jobName;
	private String jobId;
	private List<ExecutionContainerParams> containersParams;
	private Map<String, String> envMapping;

	public String getJobName() {
		return jobName;
	}

	public void setJobName(String jobName) {
		this.jobName = jobName;
	}

	public String getJobId() {
		return jobId;
	}

	public void setJobId(String jobId) {
		this.jobId = jobId;
	}

	public List<ExecutionContainerParams> getContainersParams() {
		return containersParams;
	}

	public void setContainersParams(List<ExecutionContainerParams> containersParams) {
		this.containersParams = containersParams;
	}

	public Map<String, String> getEnvMapping() {
		return envMapping;
	}

	public void setEnvMapping(Map<String, String> envMapping) {
		this.envMapping = envMapping;
	}

	public ExecutionParams addEnvMapping(String name, String value) {
		if (this.envMapping == null) this.envMapping = new HashMap<>();
		this.envMapping.put(name, value);
		return this;
	}
}

