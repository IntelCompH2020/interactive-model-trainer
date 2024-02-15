package gr.cite.intelcomp.interactivemodeltrainer.service.model;

import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.TopicModelCachedEntity;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.ModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.TopicModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.TopicBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.TopicModelBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.Topic;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicSimilarity;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.ModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.TopicLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.TopicModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersService;
import gr.cite.tools.data.builder.BuilderFactory;
import gr.cite.tools.fieldset.BaseFieldSet;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class TopicModelService extends ModelService<TopicModel, TopicModelLookup> {

    private final ContainerServicesProperties containerServicesProperties;
    private final TopicModelingParametersService topicModelingParametersService;
    private final CacheLibrary cacheLibrary;
    private final ApplicationContext applicationContext;

    @Autowired
    protected TopicModelService(BuilderFactory builderFactory, DockerService dockerService, ContainerServicesProperties containerServicesProperties, TopicModelingParametersService topicModelingParametersService, CacheLibrary cacheLibrary, ApplicationContext applicationContext) {
        super(builderFactory, dockerService);
        this.containerServicesProperties = containerServicesProperties;
        this.topicModelingParametersService = topicModelingParametersService;
        this.cacheLibrary = cacheLibrary;
        this.applicationContext = applicationContext;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<TopicModel> getAll(TopicModelLookup lookup) throws IOException, InterruptedException, ApiException {
        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();
        lookup.setModelType(ModelType.TOPIC);
        List<TopicModelEntity> data = (List<TopicModelEntity>) dockerService.listModels(lookup, users);
        if (lookup.getOrder() == null || lookup.getOrder().isEmpty() || lookup.getOrder().getItems() == null || lookup.getOrder().getItems().isEmpty()) {
            return builderFactory.builder(TopicModelBuilder.class).build(lookup.getProject(), data, users);
        }
        String orderItem = lookup.getOrder().getItems().get(0);
        if (orderItem.endsWith("creator")) {
            if (orderItem.startsWith("-")) {
                return builderFactory.builder(TopicModelBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data, users);
            } else {
                return builderFactory.builder(TopicModelBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data, users);
            }
        }
        return builderFactory.builder(TopicModelBuilder.class).build(lookup.getProject(), data, users);
    }

    public void patch(String name, String description, String visibility) {
        this.topicModelingParametersService.updateRootConfigurationFile(name, description, visibility);
        this.cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
    }

    public void patchHierarchical(String parentName, String name, String description, String visibility) {
        this.topicModelingParametersService.updateHierarchicalConfigurationFile(parentName, name, description, visibility);
        this.cacheLibrary.setDirtyByKey(TopicModelCachedEntity.CODE);
    }

    @SuppressWarnings("unchecked")
    public List<TopicModel> getModel(String name) throws IOException, InterruptedException, ApiException {
        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();
        ModelLookup lookup = new ModelLookup();
        lookup.setModelType(ModelType.TOPIC);
        lookup.setProject(new BaseFieldSet("name", "type", "params"));
        List<? extends ModelEntity> data = dockerService.getModel(lookup, name);
        return builderFactory.builder(TopicModelBuilder.class).build(lookup.getProject(), (List<TopicModelEntity>) data, users);
    }

    public List<Topic> getAllTopics(String name, TopicLookup lookup) throws IOException, InterruptedException, ApiException {
        List<TopicEntity> data = dockerService.listTopics(name, lookup);
        return builderFactory.builder(TopicBuilder.class).build(lookup.getProject(), data);
    }

    public void setTopicLabels(String name, ArrayList<String> labels) throws IOException, InterruptedException, ApiException {
        dockerService.setTopicLabels(name, labels);
    }

    public TopicSimilarity getSimilarTopics(String name, Integer pairs) throws IOException, InterruptedException, ApiException {
        return dockerService.getSimilarTopics(name, pairs);
    }

    @Deprecated
    public void fuseTopics(String name, ArrayList<Integer> topics) throws IOException, InterruptedException, ApiException {
        dockerService.fuseTopics(name, topics);
    }

    @Deprecated
    public void sortTopics(String name) throws IOException, InterruptedException, ApiException {
        dockerService.sortTopics(name);
    }

    public void deleteTopics(String name, ArrayList<Integer> topics) throws IOException, InterruptedException, ApiException {
        dockerService.deleteTopics(name, topics);
    }

    public String getPyLDAvis(String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "pyLDAvis.html");
        return Files.readString(file);
    }

    public String getD3(String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "d3.js");
        return Files.readString(file);
    }

    public String getPyLDAvisLibrary(String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "ldavis.v3.0.0.js");
        return Files.readString(file);
    }

    public String getPyLDAvis(String parentName, String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + parentName + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "pyLDAvis.html");
        return Files.readString(file);
    }

    public String getD3(String parentName, String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + parentName + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "d3.js");
        return Files.readString(file);
    }

    public String getPyLDAvisLibrary(String parentName, String name) throws IOException {
        String modelFolder = containerServicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class) + "/" + parentName + "/" + name;
        Path file = Path.of(modelFolder, "TMmodel", "ldavis.v3.0.0.js");
        return Files.readString(file);
    }

}
