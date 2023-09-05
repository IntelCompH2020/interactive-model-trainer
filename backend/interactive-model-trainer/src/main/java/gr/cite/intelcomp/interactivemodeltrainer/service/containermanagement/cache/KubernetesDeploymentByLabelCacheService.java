package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.cache;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.tools.cache.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class KubernetesDeploymentByLabelCacheService extends CacheService<KubernetesDeploymentByLabelCacheService.KubernetesDeploymentByLabelCacheValue> {

    public static class KubernetesDeploymentByLabelCacheValue {

        public KubernetesDeploymentByLabelCacheValue() {
        }

        public KubernetesDeploymentByLabelCacheValue(String namespace, String deploymentLabel, String name) {
            this.namespace = namespace;
            this.deploymentLabel = deploymentLabel;
            this.name = name;
        }

        private String namespace;

        public String getNamespace() {
            return namespace;
        }

        public void setNamespace(String namespace) {
            this.namespace = namespace;
        }

        private String deploymentLabel;

        public String getDeploymentLabel() {
            return deploymentLabel;
        }

        public void setDeploymentLabel(String deploymentLabel) {
            this.deploymentLabel = deploymentLabel;
        }

        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @Autowired
    public KubernetesDeploymentByLabelCacheService(KubernetesDeploymentByLabelCacheOptions options) {
        super(options);
    }

    @Override
    protected Class<KubernetesDeploymentByLabelCacheValue> valueClass() {
        return KubernetesDeploymentByLabelCacheValue.class;
    }

    @Override
    public String keyOf(KubernetesDeploymentByLabelCacheValue value) {
        return this.buildKey(value.getNamespace(), value.getDeploymentLabel());
    }

    public String buildKey(String namespace, String deploymentLabel) {
        HashMap<String, String> keyPaths = new HashMap<>();
        keyPaths.put("$namespace$", namespace);
        keyPaths.put("$label$", deploymentLabel);
        return this.generateKey(keyPaths);
    }
}
