package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(DockerProperties.class)
public class DockerConfiguration {
}
