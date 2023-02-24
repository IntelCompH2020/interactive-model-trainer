package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models;

import java.util.HashMap;
import java.util.Map;

public class ExecutionContainerParams {
	private String container;
	private Map<String, String> envMapping;

	public ExecutionContainerParams(String container, Map<String, String> envMapping) {
		this.container = container;
		this.envMapping = envMapping;
	}

	public String getContainer() {
		return container;
	}

	public void setContainer(String container) {
		this.container = container;
	}

	public Map<String, String> getEnvMapping() {
		return envMapping;
	}

	public void setEnvMapping(Map<String, String> envMapping) {
		this.envMapping = envMapping;
	}

	public ExecutionContainerParams addEnvMapping(String name, String value) {
		if (this.envMapping == null) this.envMapping = new HashMap<>();
		this.envMapping.put(name, value);
		return this;
	}
}
