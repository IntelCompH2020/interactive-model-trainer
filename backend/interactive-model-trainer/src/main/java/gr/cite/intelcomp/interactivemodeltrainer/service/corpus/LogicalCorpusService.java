package gr.cite.intelcomp.interactivemodeltrainer.service.corpus;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.LogicalCorpusBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class LogicalCorpusService extends CorpusService<LogicalCorpus, CorpusLookup> {

    @Autowired
    protected LogicalCorpusService(BuilderFactory builderFactory, DockerService dockerService) {
        super(builderFactory, dockerService);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<LogicalCorpus> getAll(CorpusLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setCorpusType(CorpusType.LOGICAL);
        List<LogicalCorpusEntity> data = (List<LogicalCorpusEntity>) dockerService.listCorpus(lookup);
        if (lookup.getOrder() == null || lookup.getOrder().isEmpty() || lookup.getOrder().getItems() == null || lookup.getOrder().getItems().isEmpty()) {
            return builderFactory.builder(LogicalCorpusBuilder.class).build(lookup.getProject(), data);
        }
        String orderItem = lookup.getOrder().getItems().get(0);
        if (orderItem.endsWith("creator")) {
            if (orderItem.startsWith("-")) {
                return builderFactory.builder(LogicalCorpusBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data);
            } else {
                return builderFactory.builder(LogicalCorpusBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data);
            }
        }
        return builderFactory.builder(LogicalCorpusBuilder.class).build(lookup.getProject(), data);
    }

    @Override
    public void create(LogicalCorpus logicalCorpus) throws IOException, InterruptedException, ApiException {
        LogicalCorpusJson corpus = new LogicalCorpusJson(logicalCorpus);
        dockerService.createCorpus(corpus);
    }
}
