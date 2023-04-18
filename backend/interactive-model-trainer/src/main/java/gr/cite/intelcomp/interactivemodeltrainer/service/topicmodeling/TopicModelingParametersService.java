package gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling;

import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;

import java.nio.file.Path;
import java.util.UUID;

import static gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersServiceJson.HierarchicalTopicModelingParametersModel;
import static gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersServiceJson.TopicModelingParametersModel;

public abstract class TopicModelingParametersService {

    public abstract Path generateRootConfigurationFile(TrainingTaskRequestPersist config, UUID userId);

    public abstract void updateRootConfigurationFile(String name, String description, String visibility);
    public abstract TopicModelingParametersModel getRootConfigurationModel(String name);

    public abstract Path generateHierarchicalConfigurationFile(TrainingTaskRequestPersist config, UUID userId);

    public abstract void updateHierarchicalConfigurationFile(String parentName, String name, String description, String visibility);
    public abstract HierarchicalTopicModelingParametersModel getHierarchicalConfigurationFile(String parentName, String name);

    public abstract Path getHierarchicalConfigurationFile(TrainingTaskRequestPersist config);

    public abstract Path getHierarchicalConfigurationParentFile(TrainingTaskRequestPersist config);
}
