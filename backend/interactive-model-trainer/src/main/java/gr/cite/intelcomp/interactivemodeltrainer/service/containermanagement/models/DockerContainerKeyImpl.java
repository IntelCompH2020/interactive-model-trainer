package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models;

public class DockerContainerKeyImpl implements ContainerKey {
	private String containerId;

	public String getContainerId() {
		return containerId;
	}

	public void setContainerId(String containerId) {
		this.containerId = containerId;
	}

	public DockerContainerKeyImpl() {
	}

	public DockerContainerKeyImpl(String containerId) {
		this.containerId = containerId;
	}
	
}
