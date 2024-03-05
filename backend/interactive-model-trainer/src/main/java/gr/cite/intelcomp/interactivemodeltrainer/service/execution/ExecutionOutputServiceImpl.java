package gr.cite.intelcomp.interactivemodeltrainer.service.execution;

import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;
import gr.cite.tools.logging.LoggerService;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.ManageDomainModels.InnerPaths.DC_MODEL_SAMPLED_DOCUMENTS_FILE_NAME;

@Service
public class ExecutionOutputServiceImpl implements ExecutionOutputService {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(ExecutionOutputServiceImpl.class));

    private final ContainerServicesProperties containerServicesProperties;

    private final JsonHandlingService jsonHandlingService;

    public ExecutionOutputServiceImpl(
            ContainerServicesProperties containerServicesProperties,
            JsonHandlingService jsonHandlingService) {
        this.containerServicesProperties = containerServicesProperties;
        this.jsonHandlingService = jsonHandlingService;
    }

    @Override
    public void setLogs(UUID task, String modelName, List<String> logs) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), "execution.log");
        File logFile = new File(path.toUri());
        try {
            FileUtils.writeLines(logFile, logs);
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<String> getLogs(UUID task, String modelName) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), "execution.log");
        File logFile = new File(path.toUri());
        List<String> logs;
        try {
            logs = FileUtils.readLines(logFile, Charset.defaultCharset());
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
        return logs;
    }

    @Override
    public void setPuScores(UUID task, String modelName, Map<String, byte[]> diagrams) {
        diagrams.forEach((key, val) -> {
            Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), key);
            File diagramFile = new File(path.toUri());
            try {
                FileUtils.writeByteArrayToFile(diagramFile, val, false);
            } catch (IOException e) {
                logger.error(e.getMessage(), e);
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public byte[] getPuScore(UUID task, String modelName, String fileName) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), fileName);
        File diagramFile = new File(path.toUri());
        byte[] diagram;
        try {
            diagram = FileUtils.readFileToByteArray(diagramFile);
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
        return diagram;
    }

    @Override
    public List<String> getAllPuScores(UUID task, String modelName) {
        Path root = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString());
        File rootDirectory = new File(root.toUri());
        if (rootDirectory.isDirectory()) {
            Collection<File> diagrams = FileUtils.listFiles(rootDirectory, new String[]{"png"}, false);
            return diagrams.stream().map(File::getName).collect(Collectors.toList());
        } else {
            logger.error("PuScores directory not found.");
            throw new RuntimeException("PuScores directory not found.");
        }
    }

    @Override
    public void setSampledDocuments(UUID task, String modelName, List<DocumentEntity> documents) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), DC_MODEL_SAMPLED_DOCUMENTS_FILE_NAME(modelName));
        File documentsFile = new File(path.toUri());
        try {
            FileUtils.write(documentsFile, jsonHandlingService.toJson(documents), Charset.defaultCharset());
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<DocumentEntity> getSampledDocuments(UUID task, String modelName) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString(), DC_MODEL_SAMPLED_DOCUMENTS_FILE_NAME(modelName));
        File documentsFile = new File(path.toUri());
        List<DocumentEntity> documents;
        try {
            String json = FileUtils.readFileToString(documentsFile, Charset.defaultCharset());
            documents = List.of(jsonHandlingService.fromJson(DocumentEntity[].class, json));
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
        return documents;
    }

    @Override
    public void clearOutputsForModel(String modelName) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName);
        File outputsFolder = new File(path.toUri());
        if (outputsFolder.isDirectory()) {
            try {
                FileUtils.deleteDirectory(outputsFolder);
            } catch (IOException e) {
                logger.error(e.getMessage(), e);
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public void clearTaskOutput(UUID task, String modelName) {
        Path path = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), modelName, task.toString());
        File outputsFolder = new File(path.toUri());
        if (outputsFolder.isDirectory()) {
            try {
                FileUtils.deleteDirectory(outputsFolder);
            } catch (IOException e) {
                logger.error(e.getMessage(), e);
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public void renameOutputsForModel(String oldName, String newName) {
        Path oldPath = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), oldName);
        Path newPath = Path.of(containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(), newName);
        File oldFolder = new File(oldPath.toUri());
        File newFolder = new File(newPath.toUri());
        if (oldFolder.isDirectory()) {
            if (!oldFolder.renameTo(newFolder)) {
                logger.error("Not able to rename folder " + oldPath);
                throw new RuntimeException("Not able to rename folder " + oldPath);
            }
        }
    }

}
