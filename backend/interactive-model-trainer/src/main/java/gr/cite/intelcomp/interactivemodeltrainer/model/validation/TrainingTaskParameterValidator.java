package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import gr.cite.intelcomp.interactivemodeltrainer.configuration.TrainingParametersProperties;
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

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.TrainingParametersProperties.ParameterConfiguration;
import static gr.cite.intelcomp.interactivemodeltrainer.configuration.TrainingParametersProperties.ParameterType;

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
        int errors = 0;
        ParameterConfiguration validation = paramsCatalog.get(param);
        if (validation == null) {
            //No validation configuration set, although annotation is set. Do not know how to validate parameter, and fail
            onValidationException(constraintValidatorContext, new RuntimeException("No validation configuration set for the parameter " + param));
            return false;
        }
        String value = trainingTaskRequestPersist.getParameters().get(param);
        ArrayList<String> trainerParams = (ArrayList<String>) paramsByTrainer.get(trainingTaskRequestPersist.getType());
        if (trainingTaskRequestPersist.getHierarchical() != null && trainingTaskRequestPersist.getHierarchical()) {
            trainerParams.addAll(paramsByTrainer.get("hierarchical"));
        }
        if (trainerParams.contains(validation.getName())) {
            //That parameter is used by the trainer, so it must be checked
            try {
                if (value == null) {
                    //User provided null
                    if (validation.getDefaultValue() != null) {
                        //The parameter is required but not provided by the user
                        onValidationViolation(constraintValidatorContext, "null");
                        errors++;
                    } else
                        //The parameter is not required
                        return true;
                } else {
                    //Parsing and checking the provided value based on the parameter type
                    if (validation.getType().equals(ParameterType.NUMBER)) {
                        if (!validate(validation, Double.valueOf(value))) errors++;
                    } else if (validation.getType().equals(ParameterType.BOOLEAN)) {
                        if (!validateAsBoolean(validation, value)) errors++;
                    } else if (validation.getType().equals(ParameterType.STRING))  {
                        if (!validate(validation, value)) errors++;
                    } else {
                        //Unknown parameter type
                        onValidationException(constraintValidatorContext, new RuntimeException("Unknown parameter type configured"));
                        errors++;
                    }
                    if (errors > 0) {
                        onValidationViolation(constraintValidatorContext, value);
                    }
                }
            } catch (Exception e) {
                //Unexpected exception occurred during parameter value validation
                onValidationException(constraintValidatorContext, e);
                return false;
            }
        } else {
            //The parameter is not applicable to the training scenario, so we skip the validation
            return true;
        }
        return errors == 0;
    }

    private void onValidationException(ConstraintValidatorContext constraintValidatorContext, Exception e) {
        constraintValidatorContext.disableDefaultConstraintViolation();
        constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("{0}:- Exception thrown while validating parameter -> {1}", param, e.getMessage()))
                .addPropertyNode("parameters")
                .addConstraintViolation();
    }

    private void onValidationViolation(ConstraintValidatorContext constraintValidatorContext, Object value) {
        constraintValidatorContext.disableDefaultConstraintViolation();
        constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("{0}:- Invalid parameter value ''{1}''", param, value.toString()))
                .addPropertyNode("parameters")
                .addConstraintViolation();
    }

    private static boolean validate(ParameterConfiguration validation, String value) {
        if (validation.getDefaultValue() != null) {
            if (validation.getSelect() != null && validation.getSelect()) {
                return validation.getOptions() != null && validation.getOptions().contains(value);
            } else return value != null && value.trim().length() > 0;
        }
        else return value == null || value.trim().length() > 0;
    }

    private static boolean validateAsBoolean(ParameterConfiguration validation, String value) {
        if (validation.getDefaultValue() != null) {
            return List.of("true", "false").contains(value.toLowerCase());
        }
        else return true;
    }

    private static boolean validate(ParameterConfiguration validation, Double value) {
        if (validation.getDefaultValue() != null) {
            if (validation.getSelect() != null && validation.getSelect()) {
                return validation.getOptions() != null && validation.getOptions().contains(value);
            } else return validateBetween(validation, value);
        }
        else return value == null || validateBetween(validation, value);
    }

    private static boolean validateBetween(ParameterConfiguration validation, Double value) {
        if (validation.getMax() != null && validation.getMax() < value) return false;
        else return validation.getMin() == null || validation.getMin() <= value;
    }

}
