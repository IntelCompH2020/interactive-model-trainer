package gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class RunningTaskResponse {

    private List<String> logs;

    @JsonIgnore
    private Set<String> puScores;
    @JsonIgnore
    private List<DocumentEntity> documents;

    public List<String> getLogs() {
        return logs;
    }

    public void setLogs(List<String> logs) {
        this.logs = logs;
    }

    public Set<String> getPuScores() {
        return puScores;
    }

    public void setPuScores(Set<String> puScores) {
        this.puScores = puScores;
    }

    public List<DocumentEntity> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentEntity> documents) {
        this.documents = documents;
    }
}
