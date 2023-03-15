package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.*;

@ConfigurationProperties(prefix = "services")
public class ContainerServicesProperties {

    public static abstract class Manager {}

    public static class ManageLists extends Manager {
        public static List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "manageLists.py", "--path_wordlists", "/data/wordlists"));
        public static String LIST_ALL_CMD = "--listWordLists";
        public static String CREATE_CMD = "--createWordList";
        public static String COPY_CMD = "--copyWordList";
        public static String RENAME_CMD = "--renameWordList";
        public static String DELETE_CMD = "--deleteWordList";
    }

    public static class ManageCorpus extends Manager {
        public static List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "manageCorpus.py", "--path_datasets", "/data/datasets", "--path_downloaded", "/data/datasets/parquet")
        );
        public static String LIST_ALL_DOWNLOADED_CMD = "--listDownloaded";
        public static String LIST_ALL_LOGICAL_CMD = "--listTrDtset";
        public static String CREATE_CMD = "--saveTrDtset";
        public static String COPY_CMD = "--copyTrDtset";
        public static String RENAME_CMD = "--renameTrDtset";
        public static String DELETE_CMD = "--deleteTrDtset";
    }

    public static class ManageTopicModels extends Manager {
        public static List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "/app/manageModels.py", "--path_TMmodels", "/data/TMmodels")
        );
        public static String PATH_TM_MODELS = "--path_TMmodels /data/TMmodels";
        public static String LIST_ALL_TM_MODELS_CMD = "--listTMmodels";
        public static String GET_TM_MODEL_CMD = "--getTMmodel";
        public static String COPY_CMD = "--copyTM";
        public static String RENAME_CMD = "--renameTM";
        public static String DELETE_CMD = "--deleteTMmodel";
        public static String LIST_TOPICS_CMD = "--showTopicsAdvanced";
        public static String RESET_CMD = "--resetTM";
        public static String GET_SIMILAR_TOPICS_CMD = "--getSimilarTopics";
        public static String SET_TPC_LABELS_CMD = "--setTpcLabels";
        public static String FUSE_TOPICS_CMD = "--fuseTopics";
        public static String SORT_TOPICS_CMD = "--sortTopics";
        public static String DELETE_TOPICS_CMD = "--deleteTopics";

    }

    public static class ManageDomainModels extends Manager {

        public static List<String> TASK_CMD(String modelName, String task, HashMap<String, String> params) {
            List<String> command = new ArrayList<>(
                    Arrays.asList("main_dc_single_task.py", "--source", "/data/datasets")
            );
            command.addAll(Arrays.asList("--p", "/data/DCmodels/" + modelName));
            command.addAll(Arrays.asList("--task", task));
            params.forEach((key, val) -> {
                command.addAll(Arrays.asList("--" + key, Objects.requireNonNullElse(val, "")));
            });
            return command;
        }

        public static List<String> MANAGER_ENTRY_CMD = new ArrayList<>(
                Arrays.asList("python", "/app/manageModels.py", "--path_TMmodels", "/data/DCmodels")
        );

        public static String LIST_ALL_DOMAIN_CMD = "--listTMmodels";
        public static String COPY_CMD = "--copyTM";
        public static String RENAME_CMD = "--renameTM";
        public static String DELETE_CMD = "--deleteTMmodel";

    }

    private HashMap<String, DockerServiceConfiguration> services;

    public HashMap<String, DockerServiceConfiguration> getServices() {
        return services;
    }

    public void setServices(HashMap<String, DockerServiceConfiguration> services) {
        this.services = services;
    }

    public static class DockerServiceConfiguration {

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
