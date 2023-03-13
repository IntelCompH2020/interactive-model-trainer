package gr.cite.intelcomp.interactivemodeltrainer.service.domainprocessing;

import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;

import java.nio.file.Path;
import java.util.UUID;

public abstract class DomainClassificationParametersService {

    public abstract Path generateConfigurationFile(DomainClassificationRequestPersist config, UUID userId);

}
