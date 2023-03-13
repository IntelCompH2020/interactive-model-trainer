package gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling;

import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;

import java.nio.file.Path;
import java.util.UUID;

public abstract class TopicModelingParametersService {

    public abstract Path generateRootConfigurationFile(TrainingTaskRequestPersist config, UUID userId);

    public abstract Path generateHierarchicalConfigurationFile(TrainingTaskRequestPersist config, UUID userId);

    public abstract Path getHierarchicalConfigurationFile(TrainingTaskRequestPersist config);

    public abstract Path getHierarchicalConfigurationParentFile(TrainingTaskRequestPersist config);
}
