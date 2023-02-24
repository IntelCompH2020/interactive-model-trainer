package gr.cite.intelcomp.interactivemodeltrainer.configuration;

public class KubernetesPodConfiguration {
	private String path;
	private String podLabelSelector;

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getPodLabelSelector() {
		return podLabelSelector;
	}

	public void setPodLabelSelector(String podLabelSelector) {
		this.podLabelSelector = podLabelSelector;
	}
}
