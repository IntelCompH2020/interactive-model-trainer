package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.ExecCreateCmdResponse;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.JobStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.DockerProperties;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ContainerKey;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.DockerContainerKeyImpl;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionContainerParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.execution.ExecutionService;
import gr.cite.tools.logging.LoggerService;
import jakarta.annotation.PreDestroy;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.testcontainers.containers.output.FrameConsumerResultCallback;
import org.testcontainers.containers.output.OutputFrame;
import org.testcontainers.containers.output.ToStringConsumer;

import java.security.SecureRandom;
import java.util.*;

@Service
@ConditionalOnProperty(prefix = "docker", name = "enabled", havingValue = "true")
public class DockerContainerManagementServiceImpl extends ContainerManagementServiceImpl {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DockerContainerManagementServiceImpl.class));

    private final DockerProperties dockerProperties;

    private final DockerClient dockerClient;

    private final HashMap<String, String> syncContainerIds;

    @Autowired
    public DockerContainerManagementServiceImpl(
            DockerProperties dockerProperties,
            UserScope userScope,
            ExecutionService executionService) {
        super(userScope, executionService);
        this.dockerProperties = dockerProperties;
        DockerClientConfig dockerClientConfig = DefaultDockerClientConfig
                .createDefaultConfigBuilder()
                .withDockerHost(this.dockerProperties.getHost())
                .build();
        DockerHttpClient dockerHttpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(dockerClientConfig.getDockerHost())
                .build();
        this.dockerClient = DockerClientImpl.getInstance(dockerClientConfig, dockerHttpClient);
        this.syncContainerIds = new HashMap<>();
    }

    @PreDestroy
    public void destroy() {
        if (syncContainerIds.isEmpty())
            return;
        logger.info("Removing dynamically invoked containers...");
        for (String executionId : syncContainerIds.values()) {
            this.removeContainer(new DockerContainerKeyImpl(executionId));
        }
        syncContainerIds.clear();
    }

    @Override
    public String runJob(ExecutionParams executionParams) {
        HostConfig config = HostConfig.newHostConfig();
        if (dockerProperties.getJobs().get(executionParams.getJobName()).getVolumeBinding() != null) {
            List<Bind> binds = Arrays
                    .stream(dockerProperties.getJobs().get(executionParams.getJobName()).getVolumeBinding())
                    .map(Bind::parse)
                    .toList();
            config = config.withBinds(binds);
        }
        String containerName = executionParams.getJobId();
        CreateContainerCmd createContainerCmd = this.dockerClient
                .createContainerCmd(this.dockerProperties.getJobs().get(executionParams.getJobName()).getImage())
                .withHostConfig(config)
                .withName(containerName)
                .withTty(true)
                .withAttachStdout(true);

        if (executionParams.getContainersParams() != null) {
            for (ExecutionContainerParams executionContainerParams : executionParams.getContainersParams()) {
                if (executionContainerParams.getEnvMapping() == null)
                    continue;
                ArrayList<String> params = new ArrayList<>();
                for (String envName : executionParams.getEnvMapping().keySet()) {
                    params.add(envName + "=" + executionParams.getEnvMapping().get(envName));
                }
                createContainerCmd.withEnv(params);
            }
        }
        if (executionParams.getEnvMapping() != null && !executionParams.getEnvMapping().isEmpty()) {
            ArrayList<String> params = new ArrayList<>();
            for (String envName : executionParams.getEnvMapping().keySet()) {
                params.add(envName + "=" + executionParams.getEnvMapping().get(envName));
            }
            createContainerCmd.withEnv(params);
        }
        CreateContainerResponse c = createContainerCmd.exec();
        this.dockerClient.startContainerCmd(c.getId()).exec();
        return c.getId();
    }

    @Override
    public JobStatus getJobStatus(String jobId) throws Exception {
        InspectContainerResponse containerInfo = this.dockerClient.inspectContainerCmd(jobId).exec();
        return JobStatus.dockerContainerStatusToJobStatus(Objects.requireNonNull(containerInfo.getState().getStatus()));
    }

    @Override
    public void deleteJob(String jobId) {
        this.removeContainer(new DockerContainerKeyImpl(jobId));
    }

    @Override
    public ContainerKey ensureAvailableService(String service) {
        if (this.syncContainerIds.get(service) != null)
            return this.getServiceContainerKey(service);

        HostConfig config = HostConfig.newHostConfig();
        if (dockerProperties.getServices().get(service).getVolumeBinding() != null && dockerProperties.getServices().get(service).getVolumeBinding().length > 0) {
            List<Bind> binds = Arrays
                    .stream(dockerProperties.getServices().get(service).getVolumeBinding())
                    .map(Bind::parse)
                    .toList();
            config = config.withBinds(binds);
        }

        SecureRandom random = new SecureRandom();
        String containerName = "imt_" + service + "_" + random.nextInt();
        CreateContainerResponse c = this.dockerClient
                .createContainerCmd(this.dockerProperties.getServices().get(service).getImage())
                .withHostConfig(config)
                .withName(containerName)
                .withTty(true)
                .withAttachStdout(true)
                .exec();

        this.dockerClient.startContainerCmd(c.getId()).exec();
        this.syncContainerIds.put(service, c.getId());
        return this.getServiceContainerKey(service);
    }

    private ContainerKey getServiceContainerKey(String service) {
        if (this.syncContainerIds.get(service) == null)
            this.ensureAvailableService(service);
        return new DockerContainerKeyImpl(this.syncContainerIds.get(service));
    }

    @Override
    public String execCommand(CommandType type, List<String> command, ContainerKey executionKey) throws InterruptedException {
        logger.debug("Executing docker command -> {}", command.stream().reduce("", (result, element) -> result + " " + element).trim());
        ExecCreateCmdResponse execCreate = this.dockerClient
                .execCreateCmd(((DockerContainerKeyImpl) executionKey).getContainerId())
                .withAttachStdout(true)
                .withAttachStderr(true)
                .withAttachStdin(true)
                .withTty(true)
                .withCmd(command.toArray(new String[0]))
                .exec();

        FrameConsumerResultCallback callback = new FrameConsumerResultCallback();
        ToStringConsumer result = new ToStringConsumer();
        callback.addConsumer(OutputFrame.OutputType.STDOUT, result);

        this.dockerClient
                .execStartCmd(execCreate.getId())
                .withDetach(false)
                .exec(callback)
                .awaitCompletion();
        String collectedResult = result.toUtf8String();
        logger.debug(collectedResult);
        return collectedResult;
    }

    private void removeContainer(DockerContainerKeyImpl executionKey) {
        JobStatus status;
        try {
            status = this.getJobStatus(executionKey.getContainerId());
        } catch (Exception e) {
            status = JobStatus.FINISHED;
        }
        if (status == JobStatus.RUNNING)
            this.dockerClient.stopContainerCmd(executionKey.getContainerId()).exec();
        this.dockerClient.removeContainerCmd(executionKey.getContainerId()).exec();
    }

    @Override
    public void removeService(String service) {
        if (this.syncContainerIds.get(service) != null)
            return;
        this.removeContainer(new DockerContainerKeyImpl(this.syncContainerIds.get(service)));
        this.syncContainerIds.remove(service);
    }

}
