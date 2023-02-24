package gr.cite.intelcomp.interactivemodeltrainer.configuration;

public class KubernetesDeploymentConfiguration {
	private String path;
	private String deploymentLabelSelector;
	private String podLabelSelector;
	
	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getDeploymentLabelSelector() {
		return deploymentLabelSelector;
	}

	public void setDeploymentLabelSelector(String deploymentLabelSelector) {
		this.deploymentLabelSelector = deploymentLabelSelector;
	}

	public String getPodLabelSelector() {
		return podLabelSelector;
	}

	public void setPodLabelSelector(String podLabelSelector) {
		this.podLabelSelector = podLabelSelector;
	}
}

