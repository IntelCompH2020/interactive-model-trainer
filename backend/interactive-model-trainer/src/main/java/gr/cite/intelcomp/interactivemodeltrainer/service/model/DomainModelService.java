package gr.cite.intelcomp.interactivemodeltrainer.service.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.ModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.DomainModelBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.ModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class DomainModelService extends ModelService<DomainModel, ModelLookup>{

    @Autowired
    protected DomainModelService(BuilderFactory builderFactory, DockerService dockerService) {
        super(builderFactory, dockerService);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<DomainModel> getAll(ModelLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setModelType(ModelType.DOMAIN);
        List<? extends ModelEntity> data = dockerService.listModels(lookup);
        return builderFactory.builder(DomainModelBuilder.class).build(lookup.getProject(), (List<DomainModelEntity>) data);
    }

}
