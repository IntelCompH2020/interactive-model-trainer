package gr.cite.intelcomp.interactivemodeltrainer.service.corpus;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.data.CorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.RawCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.RawCorpusBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class RawCorpusService extends CorpusService<RawCorpus, CorpusLookup>{

    @Autowired
    protected RawCorpusService(BuilderFactory builderFactory, DockerService dockerService) {
        super(builderFactory, dockerService);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<RawCorpus> getAll(CorpusLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setCorpusType(CorpusType.RAW);
        List<? extends CorpusEntity> data = dockerService.listCorpus(lookup);
        return builderFactory.builder(RawCorpusBuilder.class).build(lookup.getProject(), (List<RawCorpusEntity>) data);
    }

    @Override
    public void create(RawCorpus word) throws IOException, InterruptedException {}

    @Override
    public void patch(RawCorpus corpus) throws IOException, InterruptedException, ApiException {}
}
