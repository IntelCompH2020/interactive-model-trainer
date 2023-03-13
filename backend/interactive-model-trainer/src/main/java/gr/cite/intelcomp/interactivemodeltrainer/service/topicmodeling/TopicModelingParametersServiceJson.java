package gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.tools.exception.MyValidationException;
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
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

@Service
@Primary
public final class TopicModelingParametersServiceJson extends TopicModelingParametersService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TopicModelingParametersServiceJson.class));

    private final JsonHandlingService jsonHandlingService;

    private final ContainerServicesProperties containerServicesProperties;

    @Autowired
    public TopicModelingParametersServiceJson(JsonHandlingService jsonHandlingService, ContainerServicesProperties containerServicesProperties) {
        this.jsonHandlingService = jsonHandlingService;
        this.containerServicesProperties = containerServicesProperties;
    }

    @Override
    public Path generateRootConfigurationFile(TrainingTaskRequestPersist config, UUID userId) {
        TopicModelingParametersModel contents = new TopicModelingParametersModel();
        contents.setName(config.getName());
        contents.setDescription(config.getDescription());
        contents.setVisibility(config.getVisibility());
        contents.setCreator(userId.toString());
        contents.setTrainer(config.getType());
        contents.setCreationDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSD").format(Date.from(Instant.now())));
        contents.setTrDtSet("/data/datasets/" + config.getCorpusId() + ".json");
        HashMap<String, Object> tmParams = new HashMap<>();
        //Extracting parameter names
        config.getParameters().keySet().forEach((key) -> {
            if (key.split("\\.").length > 1) {
                String paramValue = config.getParameters().get(key);
                try {
                    if (paramValue != null) {
                        if ("labels".equals(key.split("\\.")[1]))
                            tmParams.put(key.split("\\.")[1], "/data/wordlists/" + paramValue);
                        else {
                            Double numValue = Double.valueOf(paramValue);
                            if (isWholeNumber(numValue)) tmParams.put(key.split("\\.")[1], numValue.intValue());
                            else tmParams.put(key.split("\\.")[1], numValue);
                        }
                    } else {
                        if ("labels".equals(key.split("\\.")[1])) tmParams.put(key.split("\\.")[1], "");
                        else tmParams.put(key.split("\\.")[1], null);
                    }
                } catch (NumberFormatException e) {
                    tmParams.put(key.split("\\.")[1], paramValue);
                }
            }
        });
        if ("mallet".equals(config.getType())) {
            tmParams.put("mallet_path", "/app/mallet-2.0.8/bin/mallet");
        }
        contents.setTmParams(tmParams);
        contents.setHierarchyLevel(0);
        contents.setHtmVersion(null);
        contents.setPreProcessing(new TopicModelingParametersModel.PreprocessingParameters());

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
                logger.debug("Training configuration file for model '{}' already exists, overriding contents", config.getName());
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
    public Path generateHierarchicalConfigurationFile(TrainingTaskRequestPersist params, UUID userId) {
        HierarchicalTopicModelingParametersModel contents = new HierarchicalTopicModelingParametersModel();
        contents.setName(params.getName());
        contents.setDescription(params.getDescription());
        contents.setVisibility(params.getVisibility());
        contents.setCreator(userId.toString());
        contents.setTrainer(params.getType());
        contents.setTopicId(params.getTopicId());
        contents.setThreshold(Double.valueOf(params.getParameters().get("Hierarchical.thr")));
        contents.setCreationDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSD").format(Date.from(Instant.now())));
        HashMap<String, Object> tmParams = new HashMap<>();
        //Extracting parameter names
        params.getParameters().keySet().forEach((key) -> {
            if (key.split("\\.").length > 1) {
                String paramValue = params.getParameters().get(key);
                try {
                    if (paramValue != null) {
                        if ("labels".equals(key.split("\\.")[1]))
                            tmParams.put(key.split("\\.")[1], "/data/wordlists/" + paramValue);
                        else {
                            Double numValue = Double.valueOf(paramValue);
                            if (isWholeNumber(numValue)) tmParams.put(key.split("\\.")[1], numValue.intValue());
                            else tmParams.put(key.split("\\.")[1], numValue);
                        }
                    } else {
                        if ("labels".equals(key.split("\\.")[1])) tmParams.put(key.split("\\.")[1], "");
                        else tmParams.put(key.split("\\.")[1], null);
                    }
                } catch (NumberFormatException e) {
                    tmParams.put(key.split("\\.")[1], paramValue);
                }
            }
        });
        if ("mallet".equals(params.getType())) {
            tmParams.put("mallet_path", "/app/mallet-2.0.8/bin/mallet");
        }
        contents.setHtmVersion(params.getParameters().get("Hierarchical.htm"));
        contents.setHierarchyLevel(1);
        contents.setEmbeddings("");
        tmParams.remove("htm");
        tmParams.remove("thr");
        contents.setTmParams(tmParams);

        try {
            String modelFolder = containerServicesProperties.getServices().get("training").getVolumeConfiguration().get("tm_models_folder")
                    + "/" + params.getParentName()
                    + "/" + params.getName();
            Path modelFolderPath = Path.of(modelFolder);
            if (!Files.isDirectory(modelFolderPath)) {
                Files.createDirectory(modelFolderPath);
            }
            Path filePath = Path.of(modelFolder, "trainconfig.json");
            Path logs = Path.of(modelFolder, "execution.log");
            if (!Files.exists(filePath)) {
                Files.createFile(filePath);
            } else {
                logger.debug("Training configuration file for model '{}' already exists, overriding contents", params.getName());
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
    public Path getHierarchicalConfigurationFile(TrainingTaskRequestPersist config) {
        String modelFolder = containerServicesProperties.getServices().get("training").getVolumeConfiguration().get("tm_models_folder")
                + "/" + config.getParentName()
                + "/" + config.getName();
        return Path.of(modelFolder, "trainconfig.json");
    }

    @Override
    public Path getHierarchicalConfigurationParentFile(TrainingTaskRequestPersist config) {
        String modelFolder = containerServicesProperties.getServices().get("training").getVolumeConfiguration().get("tm_models_folder")
                + "/" + config.getParentName();
        return Path.of(modelFolder, "trainconfig.json");
    }

    private static boolean isWholeNumber(Double number) {
        return number - Math.floor(number) == 0;
    }

    private static class TopicModelingParametersModel {
        private String name;
        private String description;
        private String visibility;
        private String creator;
        private String trainer;
        private String trDtSet;
        private PreprocessingParameters preProcessing;
        private HashMap<String, Object> tmParams;
        private String creationDate;
        private Integer hierarchyLevel;
        private String htmVersion;

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

        public String getTrainer() {
            return trainer;
        }

        public void setTrainer(String trainer) {
            this.trainer = trainer;
        }

        @JsonProperty("TrDtSet")
        public String getTrDtSet() {
            return trDtSet;
        }

        @JsonProperty("TrDtSet")
        public void setTrDtSet(String trDtSet) {
            this.trDtSet = trDtSet;
        }

        @JsonProperty("Preproc")
        public PreprocessingParameters getPreProcessing() {
            return preProcessing;
        }

        @JsonProperty("Preproc")
        public void setPreProcessing(PreprocessingParameters preProcessing) {
            this.preProcessing = preProcessing;
        }

        @JsonProperty("TMparam")
        public HashMap<String, Object> getTmParams() {
            return tmParams;
        }

        @JsonProperty("TMparam")
        public void setTmParams(HashMap<String, Object> tmParams) {
            this.tmParams = tmParams;
        }

        @JsonProperty("creation_date")
        public String getCreationDate() {
            return creationDate;
        }

        @JsonProperty("creation_date")
        public void setCreationDate(String creationDate) {
            this.creationDate = creationDate;
        }

        @JsonProperty("hierarchy-level")
        public Integer getHierarchyLevel() {
            return hierarchyLevel;
        }

        @JsonProperty("hierarchy-level")
        public void setHierarchyLevel(Integer hierarchyLevel) {
            this.hierarchyLevel = hierarchyLevel;
        }

        @JsonProperty("htm-version")
        public String getHtmVersion() {
            return htmVersion;
        }

        @JsonProperty("htm-version")
        public void setHtmVersion(String htmVersion) {
            if (HTM.HTM_DS.equals(htmVersion) || HTM.HTM_WS.equals(htmVersion) || htmVersion == null) {
                this.htmVersion = htmVersion;
            } else {
                throw new MyValidationException("Htm version '" + htmVersion + "' not valid.");
            }
        }

        public static class HTM {
            public static final String HTM_DS = "htm-ds";
            public static final String HTM_WS = "htm-ws";
        }

        private static class PreprocessingParameters {
            private Integer minLemas = 15;
            private Double noBelow = 15.0;
            private Double noAbove = 0.4;
            private Integer keepN = 100000;
            private ArrayList<String> stopwords = new ArrayList<>();
            private ArrayList<String> equivalences = new ArrayList<>();

            @JsonProperty("min_lemas")
            public Integer getMinLemas() {
                return minLemas;
            }

            @JsonProperty("min_lemas")
            public void setMinLemas(Integer minLemas) {
                this.minLemas = minLemas;
            }

            @JsonProperty("no_below")
            public Double getNoBelow() {
                return noBelow;
            }

            @JsonProperty("no_below")
            public void setNoBelow(Double noBelow) {
                this.noBelow = noBelow;
            }

            @JsonProperty("no_above")
            public Double getNoAbove() {
                return noAbove;
            }

            @JsonProperty("no_above")
            public void setNoAbove(Double noAbove) {
                this.noAbove = noAbove;
            }

            @JsonProperty("keep_n")
            public Integer getKeepN() {
                return keepN;
            }

            @JsonProperty("keep_n")
            public void setKeepN(Integer keepN) {
                this.keepN = keepN;
            }

            public ArrayList<String> getStopwords() {
                return stopwords;
            }

            public void setStopwords(ArrayList<String> stopwords) {
                this.stopwords = stopwords;
            }

            public ArrayList<String> getEquivalences() {
                return equivalences;
            }

            public void setEquivalences(ArrayList<String> equivalences) {
                this.equivalences = equivalences;
            }
        }

    }

    private static class HierarchicalTopicModelingParametersModel {
        private String name;
        private String description;
        private String visibility;
        private String creator;
        private String trainer;
        private Integer topicId;
        private Double threshold;
        private HashMap<String, Object> tmParams;
        private String creationDate;
        private Integer hierarchyLevel;
        private String htmVersion;
        private String embeddings;

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

        public String getTrainer() {
            return trainer;
        }

        public void setTrainer(String trainer) {
            this.trainer = trainer;
        }

        @JsonProperty("expansion_tpc")
        public Integer getTopicId() {
            return topicId;
        }

        @JsonProperty("expansion_tpc")
        public void setTopicId(Integer topicId) {
            this.topicId = topicId;
        }

        @JsonProperty("thr")
        public Double getThreshold() {
            return threshold;
        }

        @JsonProperty("thr")
        public void setThreshold(Double threshold) {
            this.threshold = threshold;
        }

        @JsonProperty("TMparam")
        public HashMap<String, Object> getTmParams() {
            return tmParams;
        }

        @JsonProperty("TMparam")
        public void setTmParams(HashMap<String, Object> tmParams) {
            this.tmParams = tmParams;
        }

        @JsonProperty("creation_date")
        public String getCreationDate() {
            return creationDate;
        }

        @JsonProperty("creation_date")
        public void setCreationDate(String creationDate) {
            this.creationDate = creationDate;
        }

        @JsonProperty("hierarchy-level")
        public Integer getHierarchyLevel() {
            return hierarchyLevel;
        }

        @JsonProperty("hierarchy-level")
        public void setHierarchyLevel(Integer hierarchyLevel) {
            this.hierarchyLevel = hierarchyLevel;
        }

        @JsonProperty("htm-version")
        public String getHtmVersion() {
            return htmVersion;
        }

        @JsonProperty("htm-version")
        public void setHtmVersion(String htmVersion) {
            if (HTM.HTM_DS.equals(htmVersion) || HTM.HTM_WS.equals(htmVersion) || htmVersion == null) {
                this.htmVersion = htmVersion;
            } else {
                throw new MyValidationException("Htm version '" + htmVersion + "' not valid.");
            }
        }

        public String getEmbeddings() {
            return embeddings;
        }

        public void setEmbeddings(String embeddings) {
            this.embeddings = embeddings;
        }

        public static class HTM {
            public static final String HTM_DS = "htm-ds";
            public static final String HTM_WS = "htm-ws";
        }

    }

}
