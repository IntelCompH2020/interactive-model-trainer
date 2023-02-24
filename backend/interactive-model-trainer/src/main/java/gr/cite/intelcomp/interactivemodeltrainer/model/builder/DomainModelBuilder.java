package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.fieldset.FieldSet;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class DomainModelBuilder extends BaseBuilder<DomainModel, DomainModelEntity> {

    @Autowired
    public DomainModelBuilder(ConventionService conventionService) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(DomainModelBuilder.class)));
    }

    @Override
    public List<DomainModel> build(FieldSet fields, List<DomainModelEntity> data) throws MyApplicationException {
        return new ArrayList<>();
    }
}
