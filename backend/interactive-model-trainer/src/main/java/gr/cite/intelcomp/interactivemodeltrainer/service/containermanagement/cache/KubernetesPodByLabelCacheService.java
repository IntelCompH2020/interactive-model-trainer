package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.cache;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.tools.cache.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;

@Service
public class KubernetesPodByLabelCacheService extends CacheService<KubernetesPodByLabelCacheService.KubernetesPodByLabelCacheValue> {

    public static class KubernetesPodByLabelCacheValue {

        public KubernetesPodByLabelCacheValue() {
        }

        public KubernetesPodByLabelCacheValue(String namespace, String podLabel, List<String> names) {
            this.namespace = namespace;
            this.podLabel = podLabel;
            this.names = names;
        }

        private String namespace;

        public String getNamespace() {
            return namespace;
        }

        public void setNamespace(String namespace) {
            this.namespace = namespace;
        }

        private String podLabel;

        public String getPodLabel() {
            return podLabel;
        }

        public void setPodLabel(String podLabel) {
            this.podLabel = podLabel;
        }

        private List<String> names;

        public List<String> getNames() {
            return names;
        }

        public void setNames(List<String> names) {
            this.names = names;
        }
    }

    private final ConventionService conventionService;

    @Autowired
    public KubernetesPodByLabelCacheService(KubernetesPodByLabelCacheOptions options, ConventionService conventionService) {
        super(options);
        this.conventionService = conventionService;
    }

    @Override
    protected Class<KubernetesPodByLabelCacheValue> valueClass() {
        return KubernetesPodByLabelCacheValue.class;
    }

    @Override
    public String keyOf(KubernetesPodByLabelCacheValue value) {
        return this.buildKey(value.getNamespace(), value.getPodLabel());
    }

    public String buildKey(String namespace, String podLabel) {
        HashMap<String, String> keyPaths = new HashMap<>();
        keyPaths.put("$namespace$", namespace);
        keyPaths.put("$label$", podLabel);
        return this.generateKey(keyPaths);
    }
}
