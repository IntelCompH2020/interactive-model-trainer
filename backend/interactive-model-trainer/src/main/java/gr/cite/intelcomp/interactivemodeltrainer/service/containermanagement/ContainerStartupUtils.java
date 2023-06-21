package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

import java.io.IOException;

public class ContainerStartupUtils {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(ContainerStartupUtils.class));

    public static void initServices(ApplicationContext applicationContext) {
        ContainerManagementService service = applicationContext.getBean(ContainerManagementService.class);
        try {
            service.ensureAvailableService(DockerService.MANAGE_LISTS);
            service.ensureAvailableService(DockerService.MANAGE_CORPUS);
            service.ensureAvailableService(DockerService.MANAGE_MODELS);
        } catch (IOException | ApiException e) {
            logger.error(e.getMessage(), e);
        }
    }

}
