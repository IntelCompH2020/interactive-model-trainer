package gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement;

import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.context.ApplicationContext;

import java.io.IOException;

public class ContainerStartupUtils {

    public static void initServices(ApplicationContext applicationContext) {
        ContainerManagementService service = applicationContext.getBean(ContainerManagementService.class);
        try {
            service.ensureAvailableService(DockerService.MANAGE_LISTS);
            service.ensureAvailableService(DockerService.MANAGE_CORPUS);
            service.ensureAvailableService(DockerService.MANAGE_MODELS);
        } catch (IOException | ApiException e) {
            e.printStackTrace();
        }
    }

}
