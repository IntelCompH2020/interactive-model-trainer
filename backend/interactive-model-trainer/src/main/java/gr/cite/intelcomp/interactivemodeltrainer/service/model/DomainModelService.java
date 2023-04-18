package gr.cite.intelcomp.interactivemodeltrainer.service.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.ModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.DomainModelBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.DomainModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class DomainModelService extends ModelService<DomainModel, DomainModelLookup>{

    private final DomainClassificationParametersService domainClassificationParametersService;

    @Autowired
    protected DomainModelService(BuilderFactory builderFactory, DockerService dockerService, DomainClassificationParametersService domainClassificationParametersService) {
        super(builderFactory, dockerService);
        this.domainClassificationParametersService = domainClassificationParametersService;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<DomainModel> getAll(DomainModelLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setModelType(ModelType.DOMAIN);
        List<? extends ModelEntity> data = dockerService.listModels(lookup);
        return builderFactory.builder(DomainModelBuilder.class).build(lookup.getProject(), (List<DomainModelEntity>) data);
    }

    @Override
    public void patch(String name, String description, String visibility) {
        domainClassificationParametersService.updateConfigurationFile(name, description, visibility);
    }

    @Override
    public void patch(String parentName, String name, String description, String visibility) {
        patch(name, description, visibility);
    }

}
