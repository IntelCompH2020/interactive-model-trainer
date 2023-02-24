package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;

@ConfigurationProperties(prefix = "kubernetes")
public class KubernetesProperties {
    private String namespace;

    private Boolean enabled;
    private Integer waitForRunningPodInMilliseconds;
    private HashMap<String, KubernetesServiceConfiguration> services;
    private HashMap<String, KubernetesJobConfiguration> jobs;
    private HashMap<String, KubernetesDeploymentConfiguration> deployments;
    private HashMap<String, KubernetesPodConfiguration>   pods;

    private String kubeConfPath;

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public HashMap<String, KubernetesDeploymentConfiguration> getDeployments() {
        return deployments;
    }

    public void setDeployments(HashMap<String, KubernetesDeploymentConfiguration> deployments) {
        this.deployments = deployments;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getKubeConfPath() {
        return kubeConfPath;
    }

    public void setKubeConfPath(String kubeConfPath) {
        this.kubeConfPath = kubeConfPath;
    }

    public HashMap<String, KubernetesServiceConfiguration> getServices() {
        return services;
    }

    public void setServices(HashMap<String, KubernetesServiceConfiguration> services) {
        this.services = services;
    }

    public Integer getWaitForRunningPodInMilliseconds() {
        return waitForRunningPodInMilliseconds;
    }

    public void setWaitForRunningPodInMilliseconds(Integer waitForRunningPodInMilliseconds) {
        this.waitForRunningPodInMilliseconds = waitForRunningPodInMilliseconds;
    }

    public HashMap<String, KubernetesJobConfiguration> getJobs() {
        return jobs;
    }

    public void setJobs(HashMap<String, KubernetesJobConfiguration> jobs) {
        this.jobs = jobs;
    }

    public HashMap<String, KubernetesPodConfiguration> getPods() {
        return pods;
    }

    public void setPods(HashMap<String, KubernetesPodConfiguration> pods) {
        this.pods = pods;
    }
}


