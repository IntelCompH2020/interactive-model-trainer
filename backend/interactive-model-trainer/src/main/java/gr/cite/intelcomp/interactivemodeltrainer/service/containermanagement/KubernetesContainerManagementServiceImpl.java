package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CommandType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.JobStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.*;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.cache.KubernetesDeploymentByLabelCacheService;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.cache.KubernetesPodByLabelCacheService;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ContainerKey;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionContainerParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.ExecutionParams;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.models.KubernetesContainerKeyImpl;
import gr.cite.intelcomp.interactivemodeltrainer.service.execution.ExecutionService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.Exec;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.apis.AppsV1Api;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.*;
import io.kubernetes.client.util.ClientBuilder;
import io.kubernetes.client.util.KubeConfig;
import io.kubernetes.client.util.Yaml;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.testcontainers.shaded.org.awaitility.Awaitility;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(prefix = "kubernetes", name = "enabled", havingValue = "true")
public class KubernetesContainerManagementServiceImpl extends ContainerManagementServiceImpl {
    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(KubernetesContainerManagementServiceImpl.class));
    private final KubernetesProperties kubernetesProperties;
    private final ApiClient client;
    private final KubernetesDeploymentByLabelCacheService kubernetesDeploymentByLabelCacheService;
    private final KubernetesPodByLabelCacheService kubernetesPodByLabelCacheService;
    private static final ReentrantLock ensureDeploymentLock = new ReentrantLock();
    private static final ReentrantLock getAvailablePodsLock = new ReentrantLock();

    @Autowired
    public KubernetesContainerManagementServiceImpl(KubernetesProperties kubernetesProperties, UserScope userScope, ExecutionService executionService, KubernetesDeploymentByLabelCacheService kubernetesDeploymentByLabelCacheService, KubernetesPodByLabelCacheService kubernetesPodByLabelCacheService) throws IOException {
        super(userScope, executionService);
        this.kubernetesProperties = kubernetesProperties;
        this.kubernetesDeploymentByLabelCacheService = kubernetesDeploymentByLabelCacheService;
        this.kubernetesPodByLabelCacheService = kubernetesPodByLabelCacheService;
        this.client = ClientBuilder.kubeconfig(KubeConfig.loadKubeConfig(new FileReader(ResourceUtils.getFile(this.kubernetesProperties.getKubeConfPath())))).build();
        Configuration.setDefaultApiClient(client);

    }

    public void destroy() {
        if (this.kubernetesProperties.getServices().isEmpty()) return;
        logger.info("Removing dynamically invoked containers...");
        for (String executionId : this.kubernetesProperties.getServices().keySet()) {
            try {
                this.removeService(executionId);
            } catch (ApiException e) {
            }
        }
    }

    @Override
    public ContainerKey ensureAvailableService(String service) throws IOException, ApiException {
        KubernetesServiceConfiguration serviceConfiguration = this.kubernetesProperties.getServices().get(service);
        KubernetesDeploymentConfiguration deploymentConfiguration = this.kubernetesProperties.getDeployments().get(serviceConfiguration.getDeploymentName());
        KubernetesDeploymentByLabelCacheService.KubernetesDeploymentByLabelCacheValue cacheValue = this.kubernetesDeploymentByLabelCacheService.lookup(
                this.kubernetesDeploymentByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getDeploymentLabelSelector()));
        if(cacheValue != null) return this.getServiceContainerKey(service);

        AppsV1Api appsV1Api = new AppsV1Api();
        boolean isLockAcquired = false;
        try {
            isLockAcquired = ensureDeploymentLock.tryLock(1, TimeUnit.SECONDS);
            if (isLockAcquired){
                try {
                    try {
                        V1DeploymentList deploymentList = appsV1Api.listNamespacedDeployment(this.kubernetesProperties.getNamespace(), null, null, null, null, deploymentConfiguration.getDeploymentLabelSelector(), null, null, null, null, null);
                        if (deploymentList.getItems().size() > 0) {
                            this.kubernetesDeploymentByLabelCacheService.put(new KubernetesDeploymentByLabelCacheService.KubernetesDeploymentByLabelCacheValue(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getDeploymentLabelSelector(), deploymentList.getItems().get(0).getMetadata().getName()));
                        } else {
                            String jobId = serviceConfiguration.getDeploymentName() + new SecureRandom().nextInt();
                            V1Deployment deploymentSpec = this.loadV1DeploymentYmlWithResourceLoader(deploymentConfiguration.getPath());
                            deploymentSpec.getMetadata().setName(jobId);

                            //V1Namespace namespace = api.readNamespace(this.kubernetesProperties.getNamespace(), null);
                            V1Deployment deployment = appsV1Api.createNamespacedDeployment(this.kubernetesProperties.getNamespace(), deploymentSpec, null, null, null, null);
                            this.kubernetesDeploymentByLabelCacheService.put(new KubernetesDeploymentByLabelCacheService.KubernetesDeploymentByLabelCacheValue(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getDeploymentLabelSelector(), deployment.getMetadata().getName()));
                        }
                    } catch (ApiException e) {
                        logger.error(e);
                        throw e;
                    }
                } finally {
                    ensureDeploymentLock.unlock();
                }
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return this.getServiceContainerKey(service);
    }

    private V1Deployment loadV1DeploymentYmlWithResourceLoader(String defaultPodYamlLocation) throws IOException {
        V1Deployment deploymentYaml = Yaml.loadAs(ResourceUtils.getFile(defaultPodYamlLocation), V1Deployment.class);
        logger.info("Load deployment yml");
        return deploymentYaml;
    }

    private V1Pod loadV1PodYmlWithResourceLoader(String defaultPodYamlLocation) throws IOException {
        V1Pod podYaml = Yaml.loadAs(ResourceUtils.getFile(defaultPodYamlLocation), V1Pod.class);
        logger.info("Load deployment yml");
        return podYaml;
    }

    private ContainerKey getServiceContainerKey(String service) throws IOException, ApiException {
        KubernetesServiceConfiguration serviceConfiguration = this.kubernetesProperties.getServices().get(service);
        KubernetesDeploymentConfiguration deploymentConfiguration = this.kubernetesProperties.getDeployments().get(serviceConfiguration.getDeploymentName());

        KubernetesPodByLabelCacheService.KubernetesPodByLabelCacheValue cacheValue = this.kubernetesPodByLabelCacheService.lookup(
                this.kubernetesPodByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getPodLabelSelector()));
        if (cacheValue != null) return new KubernetesContainerKeyImpl(this.kubernetesProperties.getNamespace(), cacheValue.getNames().get(new SecureRandom().nextInt(cacheValue.getNames().size())), serviceConfiguration.getContainerName(), deploymentConfiguration.getPodLabelSelector());

        List<String> podNames = new ArrayList<>();
        boolean isLockAcquired = false;
        try {
            isLockAcquired = getAvailablePodsLock.tryLock(this.kubernetesProperties.getWaitForRunningPodInMilliseconds(), TimeUnit.MILLISECONDS);
            if (isLockAcquired){
                try {
                    try {
                        CoreV1Api api = new CoreV1Api();
                        V1PodList v1PodList = api.listNamespacedPod(this.kubernetesProperties.getNamespace(), null, false, null, null, deploymentConfiguration.getPodLabelSelector(), null, null, null, null, null);

                        final List<V1Pod> pods = this.getActivePods(api, deploymentConfiguration);
                        if (pods.size() == 0 && this.kubernetesProperties.getWaitForRunningPodInMilliseconds() != null) {
                            Awaitility.with().pollInterval(200, TimeUnit.MILLISECONDS).atMost(this.kubernetesProperties.getWaitForRunningPodInMilliseconds(), TimeUnit.MILLISECONDS).await()
                                    .until(() -> {
                                        pods.clear();
                                        pods.addAll(this.getActivePods(api, deploymentConfiguration));
                                        return pods.size() > 0;
                                    });
                        }
                        podNames.addAll(pods.stream().map(x -> x.getMetadata().getName()).collect(Collectors.toList()));
                        if (pods.size() > 0) this.kubernetesPodByLabelCacheService.put(new KubernetesPodByLabelCacheService.KubernetesPodByLabelCacheValue(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getPodLabelSelector(), podNames));
                    } catch (ApiException e) {
                        logger.error(e);
                        throw e;
                    }
                } finally {
                    getAvailablePodsLock.unlock();
                }
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (podNames.size() == 0) throw new RuntimeException("No running pod for " + service);

        return new KubernetesContainerKeyImpl(this.kubernetesProperties.getNamespace(), podNames.get(new SecureRandom().nextInt(podNames.size())), serviceConfiguration.getContainerName(), deploymentConfiguration.getPodLabelSelector());
    }
    
    private List<V1Pod> getActivePods(CoreV1Api api, KubernetesDeploymentConfiguration deploymentConfiguration) throws ApiException {
        V1PodList v1PodList = api.listNamespacedPod(this.kubernetesProperties.getNamespace(),  null, false, null, null,  deploymentConfiguration.getPodLabelSelector(), null,null, null, null, null);
        return v1PodList.getItems().stream().filter(x-> x.getStatus().getPhase().toLowerCase(Locale.ROOT).equals(JobStatus.PodPhase.Running.toLowerCase(Locale.ROOT))).collect(Collectors.toList());
    }

    @Override
    public String runJob(ExecutionParams executionParams) throws ApiException, IOException {
        KubernetesJobConfiguration serviceConfiguration = this.kubernetesProperties.getJobs().get(executionParams.getJobName());
        KubernetesPodConfiguration jobConfiguration = this.kubernetesProperties.getPods().get(serviceConfiguration.getJobName());

        try {
            CoreV1Api api = new CoreV1Api();
            V1Pod podSpec = this.loadV1PodYmlWithResourceLoader(jobConfiguration.getPath());

            podSpec.getMetadata().setName(executionParams.getJobId());
            if (executionParams.getContainersParams() != null){
                for (ExecutionContainerParams executionContainerParams : executionParams.getContainersParams()) {
                    V1Container container = podSpec.getSpec().getContainers().stream().filter(x-> x.getName().equals(executionContainerParams.getContainer())).findFirst().orElse(null);
                    if (executionContainerParams.getEnvMapping() != null) {
                        for (String envName : executionContainerParams.getEnvMapping().keySet()) {
                            V1EnvVar envVar = new V1EnvVar();
                            envVar.setName(envName);
                            envVar.setValue(executionContainerParams.getEnvMapping().get(envName));
                            container.addEnvItem(envVar);
                        }
                    }
                }
            }
            if (executionParams.getEnvMapping() != null && executionParams.getEnvMapping().size() > 0){
                for (V1Container container : podSpec.getSpec().getContainers()) {
                    for (String envName : executionParams.getEnvMapping().keySet()) {
                        V1EnvVar envVar = new V1EnvVar();
                        envVar.setName(envName);
                        envVar.setValue(executionParams.getEnvMapping().get(envName));
                        container.addEnvItem(envVar);
                    }
                }
            }
            V1Pod pod = api.createNamespacedPod(this.kubernetesProperties.getNamespace(), podSpec, null, null, null, null);
            return pod.getMetadata().getName();
        } catch (ApiException e) {
            logger.error(e);
            throw e;
        }

    }

    private V1Pod getPodFromKubernets(String podName) throws ApiException {
        logger.info("Getting pod");
        V1Pod pod = null;
        try {
            CoreV1Api api = new CoreV1Api();
            pod = api.readNamespacedPod(podName, this.kubernetesProperties.getNamespace(), null);
        } catch (ApiException e) {
            logger.warn(e.getMessage(), e);
            throw e;
        }
        return pod;
    }


    @Override
    public JobStatus getJobStatus(String jobId) throws ApiException, Exception {
        V1Pod pod = this.getPodFromKubernets(jobId);
        if (pod == null) {
            logger.warn("Pod is null");
            return null;
        }
        JobStatus returnedStatus = JobStatus.podStatusToJobStatus(pod.getStatus().getPhase());
        return returnedStatus;
    }

    @Override
    public void deleteJob(String jobId) throws ApiException {
        try {
            CoreV1Api api = new CoreV1Api();
            api.deleteNamespacedPod(jobId, this.kubernetesProperties.getNamespace(), null, null, null, null, null, new V1DeleteOptions());
        } catch (ApiException e) {
            logger.warn(e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public String execCommand(CommandType type, List<String> command, ContainerKey executionKey) throws InterruptedException, ApiException, IOException {
        logger.debug("Executing docker command -> {}", command.stream().reduce("", (result, element) -> result + " " + element).trim());
        
//        ExecutionEntity executionEntity = this.initializeExecution(type, String.join(" ", command));
        KubernetesContainerKeyImpl kubernetesExecutionKey = (KubernetesContainerKeyImpl) executionKey;
        try {
            Exec exec = new Exec();
            Process process = null;
            process = exec.exec(kubernetesExecutionKey.getNamespace(), kubernetesExecutionKey.getPodName(), command.toArray(new String[0]), kubernetesExecutionKey.getContainerName(), false, false);
            BufferedReader in = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder processOutput = new StringBuilder();
            try (BufferedReader processOutputReader = new BufferedReader(new InputStreamReader(process.getInputStream()));) {
                String readLine;
                while ((readLine = processOutputReader.readLine()) != null) {
                    processOutput.append(readLine + System.lineSeparator());
                }
            }
            process.waitFor();

            String collectedResult = processOutput.toString().trim();
//            this.finishAndUpdateExecution(executionEntity, collectedResult);
            logger.debug(collectedResult);
            return collectedResult;
        } catch (ApiException | IOException ex){
            this.kubernetesPodByLabelCacheService.evict(this.kubernetesPodByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), kubernetesExecutionKey.getPodLabelSelector()));
            throw  ex;
        }

    }

    @Override
    public void removeService(String service) throws ApiException {
        KubernetesServiceConfiguration serviceConfiguration = this.kubernetesProperties.getServices().get(service);
        KubernetesDeploymentConfiguration deploymentConfiguration = this.kubernetesProperties.getDeployments().get(serviceConfiguration.getDeploymentName());
        KubernetesDeploymentByLabelCacheService.KubernetesDeploymentByLabelCacheValue cacheValue = this.kubernetesDeploymentByLabelCacheService.lookup(
                this.kubernetesDeploymentByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getDeploymentLabelSelector()));
        if(cacheValue == null) return;
        AppsV1Api appsV1Api = new AppsV1Api();
        appsV1Api.deleteNamespacedDeployment(this.kubernetesProperties.getNamespace(), serviceConfiguration.getDeploymentName(), null, null, null, null, null, null);
        this.kubernetesPodByLabelCacheService.evict(this.kubernetesPodByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getPodLabelSelector()));
        this.kubernetesDeploymentByLabelCacheService.evict(this.kubernetesDeploymentByLabelCacheService.buildKey(this.kubernetesProperties.getNamespace(), deploymentConfiguration.getDeploymentLabelSelector()));
    }

}


