package gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification;

import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainLabelsSelectionJsonModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersServiceJson.DomainClassificationParametersModel;

public abstract class DomainClassificationParametersService {

    public abstract Path generateConfigurationFile(DomainClassificationRequestPersist config, UUID userId);

    public abstract void updateConfigurationFile(String name, String description, String tag, String visibility);

    public abstract void prepareLogFile(String modelName, String logFile);
    public abstract void generateLabelsFile(String modelName, String modelDomain, DomainLabelsSelectionJsonModel labels);
    public abstract List<String> getLogs(String modelName, String logFile);
    public abstract Map<String, byte[]> getPU_scores(String modelName, String modelDomain);
    public abstract List<DocumentEntity> getSampledDocuments(String modelName, String modelDomain);

    public abstract DomainClassificationParametersModel getConfigurationModel(String name);

}
