package gr.cite.intelcomp.interactivemodeltrainer.service.domainprocessing;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.TopicModelingParametersServiceJson;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@Primary
public class DomainClassificationParametersServiceJson extends DomainClassificationParametersService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DomainClassificationParametersServiceJson.class));

    private final JsonHandlingService jsonHandlingService;

    private final ContainerServicesProperties containerServicesProperties;

    @Autowired
    public DomainClassificationParametersServiceJson(JsonHandlingService jsonHandlingService, ContainerServicesProperties containerServicesProperties) {
        this.jsonHandlingService = jsonHandlingService;
        this.containerServicesProperties = containerServicesProperties;
    }

    @Override
    public Path generateConfigurationFile(DomainClassificationRequestPersist config, UUID userId) {
        DomainClassificationParametersModel contents = new DomainClassificationParametersModel();
        contents.setName(config.getName());
        contents.setDescription(config.getDescription());
        contents.setVisibility(config.getVisibility());
        contents.setCreator(userId.toString());
        contents.setCreationDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSD").format(Date.from(Instant.now())));

        try {
            String modelFolder = containerServicesProperties.getServices().get("training").getVolumeConfiguration().get("tm_models_folder") + "/" + config.getName();
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                Files.createDirectory(modelFolderPath);
            }
            Path filePath = Path.of(modelFolder, "trainconfig.json");
            Path logs = Path.of(modelFolder, "execution.log");
            if (!Files.exists(filePath)) {
                Files.createFile(filePath);
            } else {
                logger.debug("Domain classification configuration file for model '{}' already exists, overriding contents", config.getName());
            }
            String json = jsonHandlingService.toJsonSafe(contents);
            Files.write(filePath, json.getBytes(StandardCharsets.UTF_8));
            Files.createFile(logs);

            return filePath;
        } catch (IOException e) {
            logger.error(e.getStackTrace());
        }

        return null;
    }

    private static class DomainClassificationParametersModel {

        private String name;
        private String description;
        private String visibility;
        private String creator;
        private String type;
        private String corpus;
        private String tag;
        private String pathToConfig;
        private String creationDate;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getVisibility() {
            return visibility;
        }

        public void setVisibility(String visibility) {
            this.visibility = visibility;
        }

        public String getCreator() {
            return creator;
        }

        public void setCreator(String creator) {
            this.creator = creator;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getCorpus() {
            return corpus;
        }

        public void setCorpus(String corpus) {
            this.corpus = corpus;
        }

        public String getTag() {
            return tag;
        }

        public void setTag(String tag) {
            this.tag = tag;
        }

        @JsonProperty("path_to_config")
        public String getPathToConfig() {
            return pathToConfig;
        }

        @JsonProperty("path_to_config")
        public void setPathToConfig(String pathToConfig) {
            this.pathToConfig = pathToConfig;
        }

        @JsonProperty("creation_date")
        public String getCreationDate() {
            return creationDate;
        }

        @JsonProperty("creation_date")
        public void setCreationDate(String creationDate) {
            this.creationDate = creationDate;
        }
    }

}
