package gr.cite.intelcomp.interactivemodeltrainer.service.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.model.Model;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import gr.cite.tools.data.query.Lookup;
import io.kubernetes.client.openapi.ApiException;

import java.io.IOException;
import java.util.List;

public abstract class ModelService<M extends Model, L extends Lookup> {

    protected final BuilderFactory builderFactory;
    protected final DockerService dockerService;

    protected ModelService(BuilderFactory builderFactory, DockerService dockerService) {
        this.builderFactory = builderFactory;
        this.dockerService = dockerService;
    }

    public abstract List<M> getAll(L lookup) throws IOException, InterruptedException, ApiException;

    public void copy(ModelType modelType, String name) throws InterruptedException, IOException, ApiException {
        dockerService.copyModel(modelType, name);
    }

    public void rename(ModelType modelType, String oldName, String newName) throws InterruptedException, IOException, ApiException {
        dockerService.renameModel(modelType, oldName, newName);
    }

    public void delete(ModelType modelType, String name) throws IOException, InterruptedException, ApiException {
        dockerService.deleteModel(modelType, name);
    }

}
