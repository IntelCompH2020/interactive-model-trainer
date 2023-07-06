package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.persist.trainingtaskrequest.TrainingTaskRequestPersist;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;

@Component
@EnableTransactionManagement
public class TrainingTaskHierarchicalValidator implements ConstraintValidator<ValidByHierarchical, TrainingTaskRequestPersist> {

    @Autowired
    private ContainerServicesProperties servicesProperties;

    private final ObjectMapper mapper = new ObjectMapper();;

    @Override
    public void initialize(ValidByHierarchical constraintAnnotation) {
        mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS"));
    }

    @Override
    public boolean isValid(TrainingTaskRequestPersist value, ConstraintValidatorContext context) {
        int errors = 0;
        if (value.getHierarchical() == null) {
            onValidationViolation(context, "hierarchical", "null");
            errors++;
        }
        else {
            if (value.getHierarchical()) {
                if (value.getParentName() != null && value.getParentName().trim().length() > 0) {
                    Path path = Path.of(servicesProperties.getTopicTrainingService().getModelsFolder(ContainerServicesProperties.ManageTopicModels.class), value.getParentName().trim());
                    File directory = new File(String.valueOf(path));
                    try {
                        if (!directory.isDirectory()) {
                            onValidationViolation(context, "parentName", value.getParentName());
                            errors++;
                        }
                    } catch (SecurityException e) {
                        onValidationException(context, "parentName", e);
                        errors++;
                    }
                }
                else {
                    onValidationViolation(context, "parentName", value.getParentName());
                    errors++;
                }
                if (!(value.getTopicId() != null && value.getTopicId() >= 0)) {
                    onValidationViolation(context, "topicId", value.getTopicId());
                    errors++;
                }
            } else {
                if (!(value.getCorpusId() != null && value.getCorpusId().trim().length() > 0)) {
                    onValidationViolation(context, "corpusId", value.getCorpusId());
                    errors++;
                } else {
                    Path path = Path.of(servicesProperties.getServices().get("manageCorpus").getVolumeConfiguration().get("datasets_folder"), String.join("", value.getCorpusId().trim(), ".json"));
                    File file = new File(String.valueOf(path));
                    try {
                        String json = FileUtils.readFileToString(file, StandardCharsets.UTF_8);
                        LogicalCorpusEntity corpus = mapper.readValue(json, LogicalCorpusEntity.class);
                        if (!"TM".equals(corpus.getValid_for().name())) {
                            onValidationViolation(context, "validFor", corpus);
                            errors++;
                        }
                    } catch (IOException e) {
                        onValidationException(context, "corpusId", e);
                        errors++;
                    }
                }
            }
        }
        return errors == 0;
    }

    private void onValidationViolation(ConstraintValidatorContext constraintValidatorContext, String field, Object value) {
        constraintValidatorContext.disableDefaultConstraintViolation();
        constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("Invalid value ''{0}''", value.toString()))
                .addPropertyNode(field)
                .addConstraintViolation();
    }

    private void onValidationException(ConstraintValidatorContext constraintValidatorContext, String field, Exception e) {
        constraintValidatorContext.disableDefaultConstraintViolation();
        constraintValidatorContext.buildConstraintViolationWithTemplate(MessageFormat.format("''{0}'' thrown while validating ''{1}'' with message: {2}", e.getClass().getSimpleName(), field, e.getMessage()))
                .addPropertyNode(field)
                .addConstraintViolation();
    }

}
