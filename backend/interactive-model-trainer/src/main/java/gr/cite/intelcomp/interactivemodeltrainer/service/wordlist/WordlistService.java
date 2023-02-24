package gr.cite.intelcomp.interactivemodeltrainer.service.wordlist;

import gr.cite.intelcomp.interactivemodeltrainer.model.WordList;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import gr.cite.tools.data.query.Lookup;
import io.kubernetes.client.openapi.ApiException;

import java.io.IOException;
import java.util.List;

public abstract class WordlistService<W extends WordList<?>, L extends Lookup> {

    protected final BuilderFactory builderFactory;
    protected final DockerService dockerService;

    protected WordlistService(BuilderFactory builderFactory, DockerService dockerService) {
        this.builderFactory = builderFactory;
        this.dockerService = dockerService;
    }

    public abstract List<W> getAll(L lookup) throws IOException, InterruptedException, ApiException;

    public abstract void create(W word) throws IOException, InterruptedException, ApiException;

    public void copy(String name) throws InterruptedException, IOException, ApiException {
        dockerService.copyWordList(name);
    }

    public void rename(String oldName, String newName) throws InterruptedException, IOException, ApiException {
        dockerService.renameWordList(oldName, newName);
    }

    public void delete(String name) throws IOException, InterruptedException, ApiException {
        dockerService.deleteWordList(name);
    }

}
