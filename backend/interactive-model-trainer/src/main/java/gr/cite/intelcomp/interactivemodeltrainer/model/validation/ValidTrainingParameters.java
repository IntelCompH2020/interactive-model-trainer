package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
@ValidTrainingParameter(parameter = "TM.ntopics")
@ValidTrainingParameter(parameter = "TM.thetas_thr")

@ValidTrainingParameter(parameter = "MalletTM.alpha")
@ValidTrainingParameter(parameter = "MalletTM.num_iterations")
@ValidTrainingParameter(parameter = "MalletTM.optimize_interval")
@ValidTrainingParameter(parameter = "MalletTM.doc_topic_thr")
@ValidTrainingParameter(parameter = "MalletTM.num_threads")
@ValidTrainingParameter(parameter = "MalletTM.token_regexp")
@ValidTrainingParameter(parameter = "MalletTM.num_iterations_inf")
@ValidTrainingParameter(parameter = "MalletTM.labels")

@ValidTrainingParameter(parameter = "Hierarchical.thr")
@ValidTrainingParameter(parameter = "Hierarchical.htm")
public @interface ValidTrainingParameters {

    String message() default "";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

}
