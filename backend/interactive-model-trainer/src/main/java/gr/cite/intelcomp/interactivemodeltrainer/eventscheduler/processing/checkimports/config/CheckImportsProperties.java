package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties(prefix = "event-scheduler.events.check-for-imports")
public class CheckImportsProperties {

    private final Long checkIntervalInSeconds, fileSizeThresholdInMB;

    private final String hdfsServiceUrl, hdfsDataPath;

    @ConstructorBinding
    public CheckImportsProperties(Long checkIntervalInSeconds, Long fileSizeThresholdInMB, String hdfsServiceUrl, String hdfsDataPath) {
        this.checkIntervalInSeconds = checkIntervalInSeconds;
        this.fileSizeThresholdInMB = fileSizeThresholdInMB;
        this.hdfsServiceUrl = hdfsServiceUrl;
        this.hdfsDataPath = hdfsDataPath;
    }

    public Long getCheckIntervalInSeconds() {
        return checkIntervalInSeconds;
    }

    public String getHdfsServiceUrl() {
        return hdfsServiceUrl;
    }

    public String getHdfsDataPath() {
        return hdfsDataPath;
    }

    public Long getFileSizeThresholdInMB() {
        return fileSizeThresholdInMB;
    }

    public Long getFileSizeThresholdInBytes() {
        return fileSizeThresholdInMB * 1000000;
    }
}
