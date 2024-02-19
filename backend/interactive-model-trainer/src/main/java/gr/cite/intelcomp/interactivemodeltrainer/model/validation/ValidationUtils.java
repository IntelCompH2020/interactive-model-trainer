package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.tools.logging.LoggerService;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;

@Component
public class ValidationUtils {

    private final ContainerServicesProperties containerServicesProperties;

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(ValidationUtils.class));

    @Autowired
    public ValidationUtils(ContainerServicesProperties containerServicesProperties) {
        this.containerServicesProperties = containerServicesProperties;
    }

    public void tapTopicModelParameterValidator() {
        try {
            Class<?> clazz = Class.forName("gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidTrainingParameters");
            for (Annotation annotation : clazz.getAnnotations()) {
                if (annotation instanceof ValidTrainingParameter.ValidTrainingParameterList validatorWrapper) {
                    logger.trace("-------------------------------------------------------------");
                    logger.trace("Validation set for the following parameters (topic modeling):");
                    logger.trace("-------------------------------------------------------------");
                    for (ValidTrainingParameter inner : validatorWrapper.value()) {
                        logger.trace(inner.parameter());
                    }
                    logger.trace("-------------------------------------------------------------");
                }
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    public void validateWordlists() {
        Timer t = new Timer();
        t.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                String wordlistsFolder = containerServicesProperties.getWordlistService().getWordlistsFolder();
                Collection<File> lists = FileUtils.listFiles(new File(wordlistsFolder), new String[]{"json"}, false);
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                for (File list : lists) {
                    String json = null;
                    try {
                        json = FileUtils.readFileToString(list, Charset.defaultCharset());
                    } catch (IOException e) {
                        logger.error(e.getMessage(), e);
                    }
                    WordListJson parsed = gson.fromJson(json, WordListJson.class);
                    boolean update = false;
                    if (parsed.getId() == null) {
                        parsed.setId(UUID.randomUUID());
                        update = true;
                    }
                    if (parsed.getVisibility() == null || parsed.getCreator() == null || parsed.getCreator().equals("-")) {
                        if (Visibility.Public == parsed.getVisibility())
                            continue;
                        parsed.setVisibility(Visibility.Public);
                        update = true;
                    }
                    String fileName = list.getName().substring(0, list.getName().lastIndexOf('.'));
                    if (parsed.getName() != null && !parsed.getName().equals(fileName)) {
                        parsed.setName(fileName);
                        update = true;
                    }
                    if (update) {
                        try {
                            FileUtils.writeStringToFile(list, gson.toJson(parsed), Charset.defaultCharset());
                        } catch (IOException e) {
                            logger.error(e.getMessage(), e);
                        }
                    }
                }
                logger.trace("Wordlists validated");
            }
        }, 0, 1000L * 60 * 30);
    }

    public void validateLogicalCorpora() {
        Timer t = new Timer();
        t.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                String datasetsFolder = containerServicesProperties.getCorpusService().getDatasetsFolder();
                Collection<File> datasets = FileUtils.listFiles(new File(datasetsFolder), new String[]{"json"}, false);
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                for (File dataset : datasets) {
                    String json = null;
                    try {
                        json = FileUtils.readFileToString(dataset, Charset.defaultCharset());
                    } catch (IOException e) {
                        logger.error(e.getMessage(), e);
                    }
                    LogicalCorpusJson parsed = gson.fromJson(json, LogicalCorpusJson.class);
                    boolean update = false;
                    if (parsed.getId() == null) {
                        parsed.setId(UUID.randomUUID());
                        update = true;
                    }
                    if (parsed.getVisibility() == null || parsed.getCreator() == null || parsed.getCreator().equals("-")) {
                        if (Visibility.Public == parsed.getVisibility())
                            continue;
                        parsed.setVisibility(Visibility.Public);
                        update = true;
                    }
                    String fileName = dataset.getName().substring(0, dataset.getName().lastIndexOf('.'));
                    if (parsed.getName() != null && !parsed.getName().equals(fileName)) {
                        parsed.setName(fileName);
                        update = true;
                    }
                    if (update) {
                        try {
                            FileUtils.writeStringToFile(dataset, gson.toJson(parsed), Charset.defaultCharset());
                        } catch (IOException e) {
                            logger.error(e.getMessage(), e);
                        }
                    }
                }
                logger.trace("Logical corpora validated");
            }
        }, 0, 1000L * 60 * 30);
    }

    public void cleanup() {
        logger.info("Cleaning residual temporary files.");
        cleanupFolder(containerServicesProperties.getWordlistService().getTempFolder());
        cleanupFolder(containerServicesProperties.getCorpusService().getTempFolder());
        cleanupFolder(containerServicesProperties.getModelsService().getTempFolder());
        cleanupFolder(containerServicesProperties.getTopicTrainingService().getTempFolder());
        cleanupFolder(containerServicesProperties.getDomainTrainingService().getTempFolder());
        logger.info("Cleanup of temporary files completed.");
    }

    private void cleanupFolder(String path) {
        File folder = new File(path);
        if (folder.exists() && folder.isDirectory()) {
            File[] files = folder.listFiles();
            if (files == null) return;
            for (File file : files) {
                if (!file.isDirectory())
                    if (!file.delete())
                        logger.error("Failed to delete temp file {}", file.getAbsolutePath());
            }
        } else {
            logger.warn("Configured temporary file path '{}' does not exist. Review the temporary files path configuration.", folder);
        }
    }

}
