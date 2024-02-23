package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.WordlistType;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Equivalence;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
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
import java.util.stream.Collectors;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class EquivalenceBuilder extends BaseBuilder<Equivalence, WordListEntity> implements SortableByOwner<Equivalence, WordListEntity> {

    private final ApplicationContext applicationContext;

    @Autowired
    public EquivalenceBuilder(ConventionService conventionService, ApplicationContext applicationContext) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(EquivalenceBuilder.class)));
        this.applicationContext = applicationContext;
    }

    @Override
    public List<Equivalence> build(FieldSet fields, List<WordListEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty())
            return new ArrayList<>();

        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();

        List<Equivalence> models = new ArrayList<>(100);

        if (data == null)
            return models;
        for (WordListEntity d : data) {
            if (d.getValid_for() == WordlistType.equivalences) {
                Equivalence m = new Equivalence();
                if (fields.hasField(this.asIndexer(WordListJson._id)))
                    m.setId(d.getId());
                if (fields.hasField(this.asIndexer(WordListJson._name)))
                    m.setName(d.getName());
                if (fields.hasField(this.asIndexer(WordListJson._description)))
                    m.setDescription(d.getDescription());
                if (fields.hasField(this.asIndexer(WordListJson._visibility)))
                    m.setVisibility(d.getVisibility());
                if (fields.hasField(this.asIndexer(WordListJson._creator)))
                    m.setCreator(extractUsername(d.getCreator(), users));
                if (fields.hasField(this.asIndexer(WordListJson._location)))
                    m.setLocation(d.getLocation());
                if (fields.hasField(this.asIndexer(WordListJson._wordlist)))
                    m.setWordlist(d.getWordlist()
                            .stream()
                            .map(s -> new Equivalence.EquivalenceWord(s.split(":")[0], s.split(":")[1]))
                            .collect(Collectors.toList()));
                if (fields.hasField(this.asIndexer(WordListJson._creation_date)))
                    m.setCreation_date(d.getCreation_date());
                models.add(m);
            }
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }

    @Override
    public List<Equivalence> buildSortedByOwnerAsc(FieldSet directives, List<WordListEntity> data) {
        Comparator<Equivalence> byOwner = Comparator.comparing(Equivalence::getCreator);
        return build(directives, data).stream().sorted(byOwner).toList();
    }

    @Override
    public List<Equivalence> buildSortedByOwnerDesc(FieldSet directives, List<WordListEntity> data) {
        Comparator<Equivalence> byOwner = Comparator.comparing(Equivalence::getCreator);
        return build(directives, data).stream().sorted(byOwner.reversed()).toList();
    }
}
