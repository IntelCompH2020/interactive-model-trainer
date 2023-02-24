package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.JobStatus;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ContainerKey;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import io.kubernetes.client.openapi.ApiException;

import java.io.IOException;
import java.util.List;

public interface ContainerManagementService {
    ContainerKey ensureAvailableService(String service) throws IOException, ApiException;
    void removeService(String service) throws ApiException;
    String execCommand(CommandType type, List<String> command, ContainerKey executionKey) throws InterruptedException, ApiException, IOException;
    void destroy();
    String runJob(ExecutionParams executionParams) throws ApiException, IOException;
    JobStatus getJobStatus(String jobId) throws ApiException, Exception;
    void deleteJob(String jobId) throws ApiException;
}
