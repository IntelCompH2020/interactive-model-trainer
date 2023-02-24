package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.cache;

import gr.cite.tools.cache.CacheOptions;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "cache.kube-deploy-by-label")
public class KubernetesDeploymentByLabelCacheOptions extends CacheOptions {
}
