package gr.cite.intelcomp.interactivemodeltrainer.service.model;

import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.DomainModelCachedEntity;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;
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
    private final CacheLibrary cacheLibrary;

    @Autowired
    protected DomainModelService(BuilderFactory builderFactory, DockerService dockerService, DomainClassificationParametersService domainClassificationParametersService, CacheLibrary cacheLibrary) {
        super(builderFactory, dockerService);
        this.domainClassificationParametersService = domainClassificationParametersService;
        this.cacheLibrary = cacheLibrary;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<DomainModel> getAll(DomainModelLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setModelType(ModelType.DOMAIN);
        List<DomainModelEntity> data = (List<DomainModelEntity>) dockerService.listModels(lookup);
        String orderItem = lookup.getOrder().getItems().get(0);
        if (orderItem.endsWith("creator")) {
            if (orderItem.startsWith("-")) {
                return builderFactory.builder(DomainModelBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data);
            } else {
                return builderFactory.builder(DomainModelBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data);
            }
        }
        return builderFactory.builder(DomainModelBuilder.class).build(lookup.getProject(), data);
    }

    public void patch(String name, String description, String tag, String visibility) {
        domainClassificationParametersService.updateConfigurationFile(name, description, tag, visibility);
        cacheLibrary.setDirtyByKey(DomainModelCachedEntity.CODE);
    }

}
