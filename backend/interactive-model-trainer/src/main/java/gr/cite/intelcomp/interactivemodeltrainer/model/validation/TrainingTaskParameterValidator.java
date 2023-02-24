package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import gr.cite.intelcomp.interactivemodeltrainer.configuration.TrainingParametersProperties;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.TrainingParametersProperties.*;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TrainingTaskParameterValidator implements ConstraintValidator<ValidTrainingParameter, TrainingTaskRequestPersist> {

    private String param;
    private Map<String, ParameterConfiguration> paramsCatalog = new HashMap<>();
    private Map<String, List<String>> paramsByTrainer = new HashMap<>();

    @Autowired
    private TrainingParametersProperties properties;

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(TrainingTaskParameterValidator.class));

    @Override
    public void initialize(ValidTrainingParameter constraintAnnotation) {
        this.param = constraintAnnotation.parameter();
        this.paramsCatalog = properties.getParamsCatalog();
        this.paramsByTrainer = properties.getParamsByTrainer();
    }

    @Override
    public boolean isValid(TrainingTaskRequestPersist trainingTaskRequestPersist, ConstraintValidatorContext constraintValidatorContext) {
        boolean isValid;
        ParameterConfiguration validation = paramsCatalog.get(param);
        String value = trainingTaskRequestPersist.getParameters().get(param);
        ArrayList<String> trainerParams = (ArrayList<String>) paramsByTrainer.get(trainingTaskRequestPersist.getType());
        if (trainingTaskRequestPersist.getParentName() != null) {
            trainerParams.addAll(paramsByTrainer.get("hierarchical"));
        }
        if (trainerParams.contains(validation.getName())) {
            //That parameter is used by the trainer, so it must be checked
            try {
                if (validation.getType().equals(ParameterType.NUMBER)) {
                    isValid = validate(validation, Double.valueOf(value));
                } else if (validation.getType().equals(ParameterType.BOOLEAN)) {
                    isValid = validateAsBoolean(validation, value);
                } else {
                    isValid = validate(validation, value);
                }
            } catch (Exception e) {
                constraintValidatorContext.disableDefaultConstraintViolation();
                constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("''{0}'' thrown while validating parameter ''{1}''", e.getClass().getSimpleName(), param))
                        .addPropertyNode("parameters")
                        .addConstraintViolation();
                return false;
            }
        } else {
            //The parameter is not used by the trainer, so we skip the validation
            return true;
        }
        if (!isValid) {
            constraintValidatorContext.disableDefaultConstraintViolation();
            constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("Invalid value for parameter ''{0}''", param))
                    .addPropertyNode("parameters")
                    .addConstraintViolation();
        }
        return isValid;
    }

    private boolean validate(ParameterConfiguration validation, String value) {
        if (validation.getDefaultValue() != null) {
            if (validation.getSelect() != null && validation.getSelect()) {
                return validation.getOptions().contains(value);
            } else return value != null && value.trim().length() > 0;
        }
        else return value == null || value.trim().length() > 0;
    }

    private boolean validateAsBoolean(ParameterConfiguration validation, String value) {
        if (validation.getDefaultValue() != null) {
            return List.of("true", "false").contains(value.toLowerCase());
        }
        else return true;
    }

    private boolean validate(ParameterConfiguration validation, Double value) {
        if (validation.getDefaultValue() != null) {
            if (validation.getSelect() != null && validation.getSelect()) {
                return validation.getOptions().contains(value);
            } else return validation.getMin() <= value && validation.getMax() >= value;
        }
        else return value == null || (validation.getMin() <= value && validation.getMax() >= value);
    }

}
