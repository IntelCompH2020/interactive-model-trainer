package gr.cite.intelcomp.interactivemodeltrainer.service.execution;

import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ExecutionOutputService {

    void setLogs(UUID task, String modelName, List<String> logs);

    List<String> getLogs(UUID task, String modelName);

    void setPuScores(UUID task, String modelName, Map<String, byte[]> diagrams);

    byte[] getPuScore(UUID task, String modelName, String fileName);

    List<String> getAllPuScores(UUID task, String modelName);

    void setSampledDocuments(UUID task, String modelName, List<DocumentEntity> documents);

    List<DocumentEntity> getSampledDocuments(UUID task, String modelName);

    void clearOutputsForModel(String modelName);

    void clearTaskOutput(UUID task, String modelName);

    void renameOutputsForModel(String oldName, String newName);

}
