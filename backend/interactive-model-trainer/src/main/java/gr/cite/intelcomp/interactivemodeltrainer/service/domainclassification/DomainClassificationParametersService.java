package gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification;

import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification.DomainClassificationParametersServiceJson.*;

public abstract class DomainClassificationParametersService {

    public abstract Path generateConfigurationFile(DomainClassificationRequestPersist config, UUID userId);

    public abstract void updateConfigurationFile(String name, String description, String visibility);

    public abstract void prepareLogFile(String modelName, String logFile);
    public abstract List<String> getLogs(String modelName, String logFile);

    public abstract DomainClassificationParametersModel getConfigurationModel(String name);

}
