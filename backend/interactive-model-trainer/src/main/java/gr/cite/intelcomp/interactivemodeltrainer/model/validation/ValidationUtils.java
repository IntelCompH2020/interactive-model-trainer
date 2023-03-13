package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.annotation.Annotation;

@Component
public class ValidationUtils {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(ValidationUtils.class));

    public static void tapTopicModelParameterValidator() {
        try {
            Class<?> clazz = ClassLoader.getSystemClassLoader()
                    .loadClass("gr.cite.intelcomp.interactivemodeltrainer.model.validation.ValidTrainingParameters");
            for (Annotation annotation :  clazz.getAnnotations()) {
                if (annotation.annotationType().getSimpleName().equals("ValidTrainingParameterList")) {
                    ValidTrainingParameter.ValidTrainingParameterList validatorWrapper = (ValidTrainingParameter.ValidTrainingParameterList) annotation;
                    logger.debug("-------------------------------------------------------------");
                    logger.debug("Validation set for the following parameters (topic modeling):");
                    logger.debug("-------------------------------------------------------------");
                    for (ValidTrainingParameter inner: validatorWrapper.value()) {
                        logger.debug(inner.parameter());
                    }
                    logger.debug("-------------------------------------------------------------");
                }
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

}
