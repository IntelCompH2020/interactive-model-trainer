package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntityFull;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.JobStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.DockerProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItemFull;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskResponseFull;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ContainerKey;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.DockerContainerKeyImpl;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionContainerParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.execution.ExecutionService;
import gr.cite.tools.logging.LoggerService;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.testcontainers.containers.output.FrameConsumerResultCallback;
import org.testcontainers.containers.output.OutputFrame;
import org.testcontainers.containers.output.ToStringConsumer;

import javax.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.CACHE_DUMP_FILE_NAME;

@Service
@ConditionalOnProperty(prefix = "docker", name = "enabled", havingValue = "true")
public class DockerContainerManagementServiceImpl extends ContainerManagementServiceImpl {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DockerContainerManagementServiceImpl.class));

    private final DockerProperties dockerProperties;
    private final DockerClientConfig dockerClientConfig;
    private final DockerHttpClient dockerHttpClient;
    private final DockerClient dockerClient;
    private final HashMap<String, String> syncContainerIds;
    private final CacheLibrary cacheLibrary;
    private final ContainerServicesProperties containerServicesProperties;
    private final JsonHandlingService jsonHandlingService;


    @Autowired
    public DockerContainerManagementServiceImpl(DockerProperties dockerProperties, UserScope userScope, ExecutionService executionService, CacheLibrary cacheLibrary, ContainerServicesProperties containerServicesProperties, JsonHandlingService jsonHandlingService){
        super(userScope, executionService);
        this.dockerProperties = dockerProperties;
        this.cacheLibrary = cacheLibrary;
        this.containerServicesProperties = containerServicesProperties;
        this.jsonHandlingService = jsonHandlingService;
        this.dockerClientConfig = DefaultDockerClientConfig.createDefaultConfigBuilder().withDockerHost(this.dockerProperties.getHost()).build();
        this.dockerHttpClient = new ApacheDockerHttpClient.Builder().dockerHost(this.dockerClientConfig.getDockerHost()).build();
        this.dockerClient = DockerClientImpl.getInstance(this.dockerClientConfig, this.dockerHttpClient);
        this.syncContainerIds = new HashMap<>();
    }

    @PreDestroy
    public void destroy() {
        if (syncContainerIds.isEmpty()) return;
        logger.info("Removing dynamically invoked containers...");
        for (String executionId : syncContainerIds.values()) {
            this.removeContainer(new DockerContainerKeyImpl(executionId));
        }
        syncContainerIds.clear();
        logger.info("Dumping user tasks cache to a file...");
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        UserTasksCacheEntityFull cacheToWrite = objectMapper.convertValue(cache, UserTasksCacheEntityFull.class);
        for (RunningTaskQueueItemFull item : cacheToWrite.getPayload()) {
            RunningTaskQueueItem cacheItem = cache.getPayload().stream().filter(i -> i.getTask().equals(item.getTask())).collect(Collectors.toList()).get(0);
            item.setUserId(cacheItem.getUserId());
            RunningTaskResponseFull response = new RunningTaskResponseFull();
            response.setLogs(cacheItem.getResponse().getLogs());
            response.setDocuments(cacheItem.getResponse().getDocuments());
            response.setPuScores(cacheItem.getResponse().getPuScores());
            item.setResponse(response);
        }
        File file = new File(Path.of(
                containerServicesProperties.getTopicTrainingService().getTempFolder(),
                CACHE_DUMP_FILE_NAME
        ).toUri());
        try {
            FileUtils.write(file, jsonHandlingService.toJson(cacheToWrite), Charset.defaultCharset());
        } catch (IOException e) {
            logger.error("Unable to dump current user tasks to file.");
            logger.error(e.getMessage(), e);
        }
    }

    @Override
    public String runJob(ExecutionParams executionParams) {
        HostConfig config = HostConfig.newHostConfig();
//        if (dockerProperties.getJobs().get(executionParams.getJobName()).getVolumeBinding() != null && dockerProperties.getServices().get(executionParams.getJobName()).getVolumeBinding().length > 0){
        if (dockerProperties.getJobs().get(executionParams.getJobName()).getVolumeBinding() != null){
            List<Bind> binds = Arrays.stream(dockerProperties.getJobs().get(executionParams.getJobName()).getVolumeBinding()).map(Bind::parse).collect(Collectors.toList());
            config = config.withBinds(binds);
        }
        String containerName = executionParams.getJobId();
        CreateContainerCmd createContainerCmd = this.dockerClient.createContainerCmd(this.dockerProperties.getJobs().get(executionParams.getJobName()).getImage()).withHostConfig(config)
                .withName(containerName).withTty(true).withAttachStdout(true);
                
        if (executionParams.getContainersParams() != null){
            for (ExecutionContainerParams executionContainerParams : executionParams.getContainersParams()) {
                if (executionContainerParams.getEnvMapping() != null) {
                    ArrayList<String> params = new ArrayList<>();
                    for (String envName : executionParams.getEnvMapping().keySet()) {
                        params.add(envName+"="+executionParams.getEnvMapping().get(envName));
                    }
                    createContainerCmd.withEnv(params);
                }
            }
        }
        if (executionParams.getEnvMapping() != null && executionParams.getEnvMapping().size() > 0){
            ArrayList<String> params = new ArrayList<>();
            for (String envName : executionParams.getEnvMapping().keySet()) {
                params.add(envName+"="+executionParams.getEnvMapping().get(envName));
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
        if(this.syncContainerIds.get(service) != null) return this.getServiceContainerKey(service);
        
        HostConfig config = HostConfig.newHostConfig();
        if (dockerProperties.getServices().get(service).getVolumeBinding() != null && dockerProperties.getServices().get(service).getVolumeBinding().length > 0) {
            List<Bind> binds = Arrays.stream(dockerProperties.getServices().get(service).getVolumeBinding()).map(Bind::parse).collect(Collectors.toList());
            config = config.withBinds(binds);
        }
        
        String containerName = "imt_" + service + "_" + new SecureRandom().nextInt();
        CreateContainerResponse c = this.dockerClient.createContainerCmd(this.dockerProperties.getServices().get(service).getImage()).withHostConfig(config)
                .withName(containerName).withTty(true).withAttachStdout(true).exec();
        
        this.dockerClient.startContainerCmd(c.getId()).exec();
        this.syncContainerIds.put(service, c.getId());
        return this.getServiceContainerKey(service);
    }

    private ContainerKey getServiceContainerKey(String service) {
        if(this.syncContainerIds.get(service) == null) this.ensureAvailableService(service);
        return new DockerContainerKeyImpl(this.syncContainerIds.get(service));
    }
    
    @Override
    public String execCommand(CommandType type, List<String> command, ContainerKey executionKey) throws InterruptedException {
        logger.debug("Executing docker command -> {}", command.stream().reduce("", (result, element) -> result + " " + element).trim());
        ExecCreateCmdResponse execCreate = this.dockerClient.execCreateCmd(((DockerContainerKeyImpl)executionKey).getContainerId()).withAttachStdout(true)
                .withAttachStderr(true).withAttachStdin(true).withTty(true).withCmd(command.toArray(new String[0])).exec();

        FrameConsumerResultCallback callback = new FrameConsumerResultCallback();
        ToStringConsumer result = new ToStringConsumer();
        callback.addConsumer(OutputFrame.OutputType.STDOUT, result);

//        ExecutionEntity executionEntity = this.initializeExecution(type, String.join(" ", command));
        this.dockerClient.execStartCmd(execCreate.getId()).withDetach(false)
//                .withStdIn(new ByteArrayInputStream("test".getBytes(Charset.defaultCharset())))
                .exec(callback).awaitCompletion();
        String collectedResult = result.toUtf8String();
//        this.finishAndUpdateExecution(executionEntity, collectedResult);
        logger.debug(collectedResult);
        return collectedResult;
    }

    private void removeContainer(ContainerKey executionKey) {
        DockerContainerKeyImpl singleDockerContainerKey = (DockerContainerKeyImpl)executionKey;
        JobStatus status = null;
        try {
            status = this.getJobStatus(singleDockerContainerKey.getContainerId());
        } catch (Exception e) {
            status = JobStatus.FINISHED;
        }
        if(status.equals(JobStatus.RUNNING))
            this.dockerClient.stopContainerCmd(singleDockerContainerKey.getContainerId()).exec();
        this.dockerClient.removeContainerCmd(singleDockerContainerKey.getContainerId()).exec();
    }

    @Override
    public void removeService(String service) {
        if(this.syncContainerIds.get(service) != null) return;
        this.removeContainer(new DockerContainerKeyImpl(this.syncContainerIds.get(service)));
        this.syncContainerIds.remove(service);
    }

}
