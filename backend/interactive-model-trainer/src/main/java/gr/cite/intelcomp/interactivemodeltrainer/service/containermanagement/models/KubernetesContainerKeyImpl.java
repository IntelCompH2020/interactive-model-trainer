package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models;

public class KubernetesContainerKeyImpl implements ContainerKey {
	private String podName;
	private String containerName;
	private String namespace;
	private String podLabelSelector;

	public String getPodName() {
		return podName;
	}

	public void setPodName(String podName) {
		this.podName = podName;
	}

	public String getContainerName() {
		return containerName;
	}

	public void setContainerName(String containerName) {
		this.containerName = containerName;
	}

	public String getNamespace() {
		return namespace;
	}

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}

	public String getPodLabelSelector() {
		return podLabelSelector;
	}

	public void setPodLabelSelector(String podLabelSelector) {
		this.podLabelSelector = podLabelSelector;
	}

	public KubernetesContainerKeyImpl() {
	}

	public KubernetesContainerKeyImpl(String namespace, String podName, String containerName, String podLabelSelector) {
		this.namespace = namespace;
		this.podName = podName;
		this.containerName = containerName;
		this.podLabelSelector = podLabelSelector;
	}
}
