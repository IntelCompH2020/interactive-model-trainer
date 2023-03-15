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
                    logger.trace("-------------------------------------------------------------");
                    logger.trace("Validation set for the following parameters (topic modeling):");
                    logger.trace("-------------------------------------------------------------");
                    for (ValidTrainingParameter inner: validatorWrapper.value()) {
                        logger.trace(inner.parameter());
                    }
                    logger.trace("-------------------------------------------------------------");
                }
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

}
