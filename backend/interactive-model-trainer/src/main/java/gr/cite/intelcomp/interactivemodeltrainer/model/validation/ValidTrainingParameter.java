package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Constraint(validatedBy = TrainingTaskParameterValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(ValidTrainingParameter.ValidTrainingParameterList.class)
@Documented
public @interface ValidTrainingParameter {

    String parameter();
    boolean select() default false;

    String message() default "";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @interface ValidTrainingParameterList {
        ValidTrainingParameter[] value();
    }

}
