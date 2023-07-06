package gr.cite.intelcomp.interactivemodeltrainer.model.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
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

@ValidTrainingParameter(parameter = "ProdLDA.model_type")
@ValidTrainingParameter(parameter = "ProdLDA.num_epochs")
@ValidTrainingParameter(parameter = "ProdLDA.batch_size")
@ValidTrainingParameter(parameter = "ProdLDA.hidden_sizes")
@ValidTrainingParameter(parameter = "ProdLDA.activation")
@ValidTrainingParameter(parameter = "ProdLDA.dropout")
@ValidTrainingParameter(parameter = "ProdLDA.learn_priors")
@ValidTrainingParameter(parameter = "ProdLDA.lr")
@ValidTrainingParameter(parameter = "ProdLDA.momentum")
@ValidTrainingParameter(parameter = "ProdLDA.solver")
@ValidTrainingParameter(parameter = "ProdLDA.reduce_on_plateau")
@ValidTrainingParameter(parameter = "ProdLDA.topic_prior_mean")
@ValidTrainingParameter(parameter = "ProdLDA.topic_prior_variance")
@ValidTrainingParameter(parameter = "ProdLDA.num_samples")
@ValidTrainingParameter(parameter = "ProdLDA.num_data_loader_workers")

@ValidTrainingParameter(parameter = "CTM.model_type")
@ValidTrainingParameter(parameter = "CTM.num_epochs")
@ValidTrainingParameter(parameter = "CTM.batch_size")
@ValidTrainingParameter(parameter = "CTM.ctm_model_type")
@ValidTrainingParameter(parameter = "CTM.hidden_sizes")
@ValidTrainingParameter(parameter = "CTM.activation")
@ValidTrainingParameter(parameter = "CTM.dropout")
@ValidTrainingParameter(parameter = "CTM.learn_priors")
@ValidTrainingParameter(parameter = "CTM.lr")
@ValidTrainingParameter(parameter = "CTM.momentum")
@ValidTrainingParameter(parameter = "CTM.solver")
@ValidTrainingParameter(parameter = "CTM.num_samples")
@ValidTrainingParameter(parameter = "CTM.reduce_on_plateau")
@ValidTrainingParameter(parameter = "CTM.topic_prior_mean")
@ValidTrainingParameter(parameter = "CTM.topic_prior_variance")
@ValidTrainingParameter(parameter = "CTM.num_data_loader_workers")
@ValidTrainingParameter(parameter = "CTM.label_size")
@ValidTrainingParameter(parameter = "CTM.loss_weights")
@ValidTrainingParameter(parameter = "CTM.sbert_model_to_load")

@ValidTrainingParameter(parameter = "SparkLDA.alpha")
@ValidTrainingParameter(parameter = "SparkLDA.maxIterations")
@ValidTrainingParameter(parameter = "SparkLDA.optimizer")
@ValidTrainingParameter(parameter = "SparkLDA.optimizeDocConcentration")
@ValidTrainingParameter(parameter = "SparkLDA.subsamplingRate")

@ValidTrainingParameter(parameter = "Hierarchical.thr")
@ValidTrainingParameter(parameter = "Hierarchical.htm")
public @interface ValidTrainingParameters {

    String message() default "";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

}
