package gr.cite.intelcomp.interactivemodeltrainer.service.domainclassification;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.domainclassification.DomainClassificationRequestPersist;
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
import java.util.List;
import java.util.UUID;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageCorpus.InnerPaths.DATASETS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.DC_MODELS_ROOT;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.DC_MODEL_CONFIG_FILE_NAME;

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
        contents.setTag(config.getTag());
        contents.setVisibility(config.getVisibility());
        contents.setCorpus(DATASETS_ROOT + config.getCorpus() + ".json");
        contents.setPathToConfig(DC_MODELS_ROOT + config.getName() + "/" + DC_MODEL_CONFIG_FILE_NAME);
        contents.setType(config.getType());
        contents.setCreator(userId.toString());
        contents.setCreationDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSD").format(Date.from(Instant.now())));

        try {
            String modelFolder = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + config.getName();
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                Files.createDirectory(modelFolderPath);
            }
            Path filePath = Path.of(modelFolder, DC_MODEL_CONFIG_FILE_NAME);
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

    @Override
    public void updateConfigurationFile(String name, String description, String visibility) {
        try {
            String modelFolder = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + name;
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                Files.createDirectory(modelFolderPath);
            }
            Path filePath = Path.of(modelFolder, DC_MODEL_CONFIG_FILE_NAME);
            DomainClassificationParametersModel contents = this.jsonHandlingService.fromJson(DomainClassificationParametersModel.class, Files.readString(filePath, StandardCharsets.UTF_8));
            contents.setDescription(description);
            contents.setVisibility(visibility);
            String json = jsonHandlingService.toJsonSafe(contents);
            Files.write(filePath, json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            logger.error(e.getStackTrace());
        }
    }

    @Override
    public void prepareLogFile(String modelName, String logFile) {
        try {
            String modelFolder = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + modelName;
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                return;
            }
            Path filePath = Path.of(modelFolder, logFile);
            Files.write(filePath, new byte[]{});
        } catch (IOException e) {
            logger.error(e.getStackTrace());
        }
    }

    @Override
    public List<String> getLogs(String modelName, String logFile) {
        try {
            String modelFolder = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + modelName;
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                return List.of();
            }
            Path filePath = Path.of(modelFolder, logFile);
            return Files.readAllLines(filePath);
        } catch (IOException e) {
            logger.error(e.getStackTrace());
        }
        return List.of();
    }

    @Override
    public DomainClassificationParametersModel getConfigurationModel(String name) {
        try {
            String modelFolder = containerServicesProperties.getDomainTrainingService().getModelsFolder(ContainerServicesProperties.ManageDomainModels.class) + "/" + name;
            Path filePath = Path.of(modelFolder, DC_MODEL_CONFIG_FILE_NAME);
            return this.jsonHandlingService.fromJson(DomainClassificationParametersModel.class, Files.readString(filePath, StandardCharsets.UTF_8));
        } catch (IOException e) {
            logger.error(e.getStackTrace());
            return new DomainClassificationParametersModel();
        }
    }

    public static class DomainClassificationParametersModel {

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
