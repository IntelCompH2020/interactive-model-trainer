package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
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

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class WordListBuilder extends BaseBuilder<WordListJson, WordListEntity>{

    @Autowired
    public WordListBuilder(ConventionService conventionService) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(WordListBuilder.class)));
    }

    @Override
    public List<WordListJson> build(FieldSet fields, List<WordListEntity> datas) throws MyApplicationException {
        this.logger.debug("building for {} items requesting {} fields", Optional.ofNullable(datas).map(e -> e.size()).orElse(0), Optional.ofNullable(fields).map(e -> e.getFields()).map(e -> e.size()).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<WordListJson> models = new ArrayList<>();

        for (WordListEntity d : datas) {
            WordListJson m = new WordListJson();
            if (fields.hasField(this.asIndexer(WordListJson._id))) m.setId(d.getId());
            if (fields.hasField(this.asIndexer(WordListJson._name))) m.setName(d.getName());
            if (fields.hasField(this.asIndexer(WordListJson._description))) m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(WordListJson._valid_for))) m.setValid_for(d.getValid_for());
            if (fields.hasField(this.asIndexer(WordListJson._visibility))) m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(WordListJson._wordlist))) m.setWordlist(d.getWordlist());
            if (fields.hasField(this.asIndexer(WordListJson._creation_date))) m.setCreation_date(d.getCreation_date());
            models.add(m);
        }
        this.logger.debug("build {} items", Optional.ofNullable(models).map(e -> e.size()).orElse(0));
        return models;
    }
}
