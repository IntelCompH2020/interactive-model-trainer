package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.RawCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpusJson;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.fieldset.FieldSet;
import gr.cite.tools.logging.DataLogEntry;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RawCorpusBuilder extends BaseBuilder<RawCorpus, RawCorpusEntity> {

    @Autowired
    public RawCorpusBuilder(ConventionService conventionService) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(RawCorpusBuilder.class)));
    }

    @Override
    public List<RawCorpus> build(FieldSet fields, List<RawCorpusEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<RawCorpus> models = new ArrayList<>();

        if (data == null) return models;
        for (RawCorpusEntity d : data) {
            if (CorpusType.RAW != d.getType()) continue;
            RawCorpus m = new RawCorpus();
            if (fields.hasField(this.asIndexer(RawCorpusJson._id))) m.setId(d.getId());
            if (fields.hasField(this.asIndexer(RawCorpusJson._name))) m.setName(d.getName());
            if (fields.hasField(this.asIndexer(RawCorpusJson._description))) m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(RawCorpusJson._visibility))) m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(RawCorpusJson._records))) m.setRecords(d.getRecords());
            if (fields.hasField(this.asIndexer(RawCorpusJson._schema))) m.setSchema(d.getSchema());
            if (fields.hasField(this.asIndexer(RawCorpusJson._download_date))) m.setDownload_date(d.getDownload_date());
            if (fields.hasField(this.asIndexer(RawCorpusJson._source))) m.setSource(d.getSource());
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }
}
