package gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling;

import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;

import java.nio.file.Path;

public abstract class TopicModelingParametersService {

    public abstract Path generateRootConfigurationFile(TrainingTaskRequestPersist config);

    public abstract Path generateHierarchicalConfigurationFile(TrainingTaskRequestPersist config);

    public abstract Path getHierarchicalConfigurationFile(TrainingTaskRequestPersist config);

    public abstract Path getHierarchicalConfigurationParentFile(TrainingTaskRequestPersist config);
}
