package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.fieldset.FieldSet;
import gr.cite.tools.logging.DataLogEntry;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class LogicalCorpusBuilder extends BaseBuilder<LogicalCorpus, LogicalCorpusEntity> implements SortableByOwner<LogicalCorpus, LogicalCorpusEntity> {

    private final ApplicationContext applicationContext;

    @Autowired
    public LogicalCorpusBuilder(ConventionService conventionService, ObjectMapper mapper, ApplicationContext applicationContext) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(LogicalCorpusBuilder.class)));
        this.applicationContext = applicationContext;
    }

    @Override
    public List<LogicalCorpus> build(FieldSet fields, List<LogicalCorpusEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty())
            return new ArrayList<>();

        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();

        List<LogicalCorpus> models = new ArrayList<>(100);

        if (data == null)
            return models;
        for (LogicalCorpusEntity d : data) {
            if (CorpusType.LOGICAL != d.getType())
                continue;
            LogicalCorpus m = new LogicalCorpus();
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._id)))
                m.setId(d.getId());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._name)))
                m.setName(d.getName());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._description)))
                m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._visibility)))
                m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._dtsets)))
                m.setDtsets(d.getDatasets());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._valid_for)))
                m.setValid_for(d.getValid_for());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._creation_date)))
                m.setCreation_date(d.getCreation_date());
            if (fields.hasField(this.asIndexer(LogicalCorpusJson._creator)))
                m.setCreator(extractUsername(d.getCreator(), users));
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }

    @Override
    public List<LogicalCorpus> buildSortedByOwnerAsc(FieldSet directives, List<LogicalCorpusEntity> data) {
        Comparator<LogicalCorpus> byOwner = Comparator.comparing(LogicalCorpus::getCreator);
        return build(directives, data).stream().sorted(byOwner).toList();
    }

    @Override
    public List<LogicalCorpus> buildSortedByOwnerDesc(FieldSet directives, List<LogicalCorpusEntity> data) {
        Comparator<LogicalCorpus> byOwner = Comparator.comparing(LogicalCorpus::getCreator);
        return build(directives, data).stream().sorted(byOwner.reversed()).toList();
    }
}
