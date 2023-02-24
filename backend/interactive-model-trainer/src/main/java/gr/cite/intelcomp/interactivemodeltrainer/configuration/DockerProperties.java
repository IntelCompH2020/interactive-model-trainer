package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;

@ConfigurationProperties(prefix = "docker")
public class DockerProperties {
    private String host;
    private Boolean enabled;

    private HashMap<String, DockerServiceConfiguration> services;
    private HashMap<String, DockerJobConfiguration> jobs;

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public HashMap<String, DockerServiceConfiguration> getServices() {
        return services;
    }

    public void setServices(HashMap<String, DockerServiceConfiguration> services) {
        this.services = services;
    }

    public HashMap<String, DockerJobConfiguration> getJobs() {
        return jobs;
    }

    public void setJobs(HashMap<String, DockerJobConfiguration> jobs) {
        this.jobs = jobs;
    }

    public static class DockerServiceConfiguration {

        private String image;

        private HashMap<String, String> volumeConfiguration;

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public HashMap<String, String> getVolumeConfiguration() {
            return volumeConfiguration;
        }

        public void setVolumeConfiguration(HashMap<String, String> volumeConfiguration) {
            this.volumeConfiguration = volumeConfiguration;
        }

        public String[] getVolumeBinding() {
            if (volumeConfiguration == null || volumeConfiguration.get("volume_binding") == null) return null;
            return volumeConfiguration.get("volume_binding").split(", ");
        }
    }

    public static class DockerJobConfiguration {

        private String image;

        private HashMap<String, String> volumeConfiguration;

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public HashMap<String, String> getVolumeConfiguration() {
            return volumeConfiguration;
        }

        public void setVolumeConfiguration(HashMap<String, String> volumeConfiguration) {
            this.volumeConfiguration = volumeConfiguration;
        }

        public String[] getVolumeBinding() {
            if (volumeConfiguration == null || volumeConfiguration.get("volume_binding") == null) return null;
            return volumeConfiguration.get("volume_binding").split(", ");
        }
    }
}
