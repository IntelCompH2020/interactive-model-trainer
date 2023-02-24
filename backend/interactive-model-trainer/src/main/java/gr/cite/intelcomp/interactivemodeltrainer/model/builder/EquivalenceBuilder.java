package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.WordlistType;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Equivalence;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
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
import java.util.stream.Collectors;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class EquivalenceBuilder extends BaseBuilder<Equivalence, WordListEntity> {

    @Autowired
    public EquivalenceBuilder(ConventionService conventionService) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(EquivalenceBuilder.class)));
    }

    @Override
    public List<Equivalence> build(FieldSet fields, List<WordListEntity> data) throws MyApplicationException {
        this.logger.debug("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<Equivalence> models = new ArrayList<>();

        if (data == null) return models;
        for (WordListEntity d : data) {
            if (d.getValid_for() == WordlistType.equivalences) {
                Equivalence m = new Equivalence();
                if (fields.hasField(this.asIndexer(WordListJson._id))) m.setId(d.getId());
                if (fields.hasField(this.asIndexer(WordListJson._name))) m.setName(d.getName());
                if (fields.hasField(this.asIndexer(WordListJson._description))) m.setDescription(d.getDescription());
                if (fields.hasField(this.asIndexer(WordListJson._visibility))) m.setVisibility(d.getVisibility());
                if (fields.hasField(this.asIndexer(WordListJson._creator))) m.setCreator(d.getCreator());
                if (fields.hasField(this.asIndexer(WordListJson._location))) m.setLocation(d.getLocation());
                if (fields.hasField(this.asIndexer(WordListJson._wordlist))) m.setWordlist(d.getWordlist().stream().map(s -> new Equivalence.EquivalenceWord(s.split(":")[0], s.split(":")[1])).collect(Collectors.toList()));
                if (fields.hasField(this.asIndexer(WordListJson._creation_date))) m.setCreation_date(d.getCreation_date());
                models.add(m);
            }
        }
        this.logger.debug("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }
}
