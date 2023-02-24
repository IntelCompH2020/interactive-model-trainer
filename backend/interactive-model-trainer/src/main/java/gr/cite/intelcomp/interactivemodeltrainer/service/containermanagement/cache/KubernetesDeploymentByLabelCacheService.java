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

	private final ConventionService conventionService;

	@Autowired
	public KubernetesDeploymentByLabelCacheService(KubernetesDeploymentByLabelCacheOptions options, ConventionService conventionService) {
		super(options);
		this.conventionService = conventionService;
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
		return this.generateKey(new HashMap<>() {{
			put("$namespace$", namespace);
			put("$label$", deploymentLabel);
		}});
	}
}
