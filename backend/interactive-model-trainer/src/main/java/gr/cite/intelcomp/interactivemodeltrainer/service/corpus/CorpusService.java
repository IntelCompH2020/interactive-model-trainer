package gr.cite.intelcomp.interactivemodeltrainer.service.corpus;

import gr.cite.intelcomp.interactivemodeltrainer.model.Corpus;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import gr.cite.tools.data.query.Lookup;
import io.kubernetes.client.openapi.ApiException;

import java.io.IOException;
import java.util.List;

public abstract class CorpusService<C extends Corpus, L extends Lookup> {

    protected final BuilderFactory builderFactory;
    protected final DockerService dockerService;

    protected CorpusService(BuilderFactory builderFactory, DockerService dockerService) {
        this.builderFactory = builderFactory;
        this.dockerService = dockerService;
    }

    public abstract List<C> getAll(L lookup) throws IOException, InterruptedException, ApiException;

    public abstract void create(C corpus) throws IOException, InterruptedException, ApiException;

    public abstract void patch(C corpus) throws IOException, InterruptedException, ApiException;

    public void copy(String name) throws InterruptedException, IOException, ApiException {
        dockerService.copyCorpus(name);
    }

    public void rename(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        dockerService.renameCorpus(oldName, newName);
    }

    public void delete(String name) throws IOException, InterruptedException, ApiException {
        dockerService.deleteCorpus(name);
    }

}
