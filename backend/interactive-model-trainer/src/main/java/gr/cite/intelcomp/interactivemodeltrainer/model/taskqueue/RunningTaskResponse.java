package gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;

import java.util.List;
import java.util.Map;

public class RunningTaskResponse {

    private List<String> logs;

    @JsonIgnore
    private Map<String, byte[]> puScores;
    @JsonIgnore
    private List<DocumentEntity> documents;

    public List<String> getLogs() {
        return logs;
    }

    public void setLogs(List<String> logs) {
        this.logs = logs;
    }

    public Map<String, byte[]> getPuScores() {
        return puScores;
    }

    public void setPuScores(Map<String, byte[]> puScores) {
        this.puScores = puScores;
    }

    public List<DocumentEntity> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentEntity> documents) {
        this.documents = documents;
    }
}
