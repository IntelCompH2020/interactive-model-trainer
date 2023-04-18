package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.*;

@ConfigurationProperties(prefix = "services")
public class ContainerServicesProperties {

    public static abstract class Manager {}

    public static final class ManageLists extends Manager {
        public static final List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "manageLists.py", "--path_wordlists", "/data/wordlists"));
        public static final String LIST_ALL_CMD = "--listWordLists";
        public static final String CREATE_CMD = "--createWordList";
        public static final String COPY_CMD = "--copyWordList";
        public static final String RENAME_CMD = "--renameWordList";
        public static final String DELETE_CMD = "--deleteWordList";

        public static final class InnerPaths {
            public static final String WORDLISTS_ROOT = "/data/wordlists/";
        }
    }

    public static final class ManageCorpus extends Manager {
        public static final List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "manageCorpus.py", "--path_datasets", "/data/datasets", "--path_downloaded", "/data/datasets/parquet")
        );
        public static final String LIST_ALL_DOWNLOADED_CMD = "--listDownloaded";
        public static final String LIST_ALL_LOGICAL_CMD = "--listTrDtset";
        public static final String CREATE_CMD = "--saveTrDtset";
        public static final String COPY_CMD = "--copyTrDtset";
        public static final String RENAME_CMD = "--renameTrDtset";
        public static final String DELETE_CMD = "--deleteTrDtset";

        public static final class InnerPaths {
            public static final String DATASETS_ROOT = "/data/datasets/";
        }
    }

    public static final class ManageTopicModels extends Manager {
        public static final List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "/app/manageModels.py", "--path_TMmodels", "/data/TMmodels")
        );
        public static final String PATH_TM_MODELS = "--path_TMmodels /data/TMmodels";
        public static final String LIST_ALL_TM_MODELS_CMD = "--listTMmodels";
        public static final String GET_TM_MODEL_CMD = "--getTMmodel";
        public static final String COPY_CMD = "--copyTM";
        public static final String RENAME_CMD = "--renameTM";
        public static final String DELETE_CMD = "--deleteTMmodel";
        public static final String LIST_TOPICS_CMD = "--showTopicsAdvanced";
        public static final String RESET_CMD = "--resetTM";
        public static final String GET_SIMILAR_TOPICS_CMD = "--getSimilarTopics";
        public static final String SET_TPC_LABELS_CMD = "--setTpcLabels";
        public static final String FUSE_TOPICS_CMD = "--fuseTopics";
        public static final String SORT_TOPICS_CMD = "--sortTopics";
        public static final String DELETE_TOPICS_CMD = "--deleteTopics";

        public static final class InnerPaths {
            public static final String TM_MODELS_ROOT = "/data/TMmodels/";
            public static final String TM_MODEL_CONFIG_FILE_NAME = "trainconfig.json";
        }

    }

    public static final class ManageDomainModels extends Manager {

        public static List<String> TASK_CMD(String modelName, String task, HashMap<String, String> params) {
            List<String> command = new ArrayList<>(
                    Arrays.asList("main_dc_single_task.py", "--source", "/data/datasets")
            );
            command.addAll(Arrays.asList("--p", InnerPaths.DC_MODELS_ROOT + modelName));
            command.addAll(Arrays.asList("--task", task));
            params.forEach((key, val) -> {
                command.addAll(Arrays.asList("--" + key, Objects.requireNonNullElse(val, "")));
            });
            return command;
        }

        public static final List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "/app/manageModels.py", "--path_TMmodels", "/data/DCmodels")
        );

        public static final String LIST_ALL_DOMAIN_CMD = "--listTMmodels";
        public static final String COPY_CMD = "--copyTM";
        public static final String RENAME_CMD = "--renameTM";
        public static final String DELETE_CMD = "--deleteTMmodel";

        public static final class InnerPaths {
            public static final String DC_MODELS_ROOT = "/data/DCmodels/";
            public static final String DC_MODEL_CONFIG_FILE_NAME = "dc_config.json";
        }

    }

    private HashMap<String, DockerServiceConfiguration> services;

    public HashMap<String, DockerServiceConfiguration> getServices() {
        return services;
    }

    public DockerServiceConfiguration getTopicTrainingService() {
        return services.get("training");
    }

    public DockerServiceConfiguration getDomainTrainingService() {
        return services.get("domainTraining");
    }

    public void setServices(HashMap<String, DockerServiceConfiguration> services) {
        this.services = services;
    }

    public static class DockerServiceConfiguration {

        public static final String TRAIN_TOPIC_MODELS_SERVICE_NAME = "trainModels";
        public static final String TOPIC_MODEL_TASKS_SERVICE_NAME = "resetModel";
        public static final String TRAIN_DOMAIN_MODELS_SERVICE_NAME = "trainDomainModels";

        private HashMap<String, String> volumeConfiguration;

        public HashMap<String, String> getVolumeConfiguration() {
            return volumeConfiguration;
        }

        public void setVolumeConfiguration(HashMap<String, String> volumeConfiguration) {
            this.volumeConfiguration = volumeConfiguration;
        }

        public String getTempFolder() {
            if (volumeConfiguration == null || volumeConfiguration.get("temp_folder") == null) return null;
            return volumeConfiguration.get("temp_folder");
        }

        public String getModelsFolder(Class<? extends Manager> manager) {
            if (volumeConfiguration == null) return null;
            if (volumeConfiguration.get("tm_models_folder") != null && ManageTopicModels.class.equals(manager)) return volumeConfiguration.get("tm_models_folder");
            if (volumeConfiguration.get("dc_models_folder") != null && ManageDomainModels.class.equals(manager)) return volumeConfiguration.get("dc_models_folder");
            return null;
        }

    }

}
