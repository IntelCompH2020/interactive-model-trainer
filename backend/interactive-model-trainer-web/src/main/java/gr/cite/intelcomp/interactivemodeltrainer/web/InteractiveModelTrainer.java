package gr.cite.intelcomp.interactivemodeltrainer.web;

import gr.cite.intelcomp.interactivemodeltrainer.common.utils.EventSchedulerUtils;
import gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidationUtils;
import gr.cite.intelcomp.interactivemodeltrainer.service.containermanagement.ContainerStartupUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({
        "gr.cite.intelcomp.interactivemodeltrainer",
        "gr.cite.tools",
        "gr.cite.commons"})
@EntityScan({
        "gr.cite.intelcomp.interactivemodeltrainer.data"})
public class InteractiveModelTrainer {

    public static void main(String[] args) {
        ApplicationContext applicationContext = SpringApplication.run(InteractiveModelTrainer.class, args);
        EventSchedulerUtils.initializeRunningTasksCheckEvent(applicationContext);
        ValidationUtils validationUtils = applicationContext.getBean(ValidationUtils.class);
        validationUtils.tapTopicModelParameterValidator();
        validationUtils.validateWordlists();
        validationUtils.validateLogicalCorpora();
        validationUtils.cleanup();
        ContainerStartupUtils.initServices(applicationContext);
    }

}
