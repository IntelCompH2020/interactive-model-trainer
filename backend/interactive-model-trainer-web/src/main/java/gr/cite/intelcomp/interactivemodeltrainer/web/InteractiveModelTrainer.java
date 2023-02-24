package gr.cite.intelcomp.interactivemodeltrainer.web;

import gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling.EventSchedulerUtils;
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
    }

}
