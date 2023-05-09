package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.Topic;
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
public class TopicBuilder extends BaseBuilder<Topic, TopicEntity> {

    @Autowired
    public TopicBuilder(ConventionService conventionService) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(TopicBuilder.class)));
    }

    @Override
    public List<Topic> build(FieldSet fields, List<TopicEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<Topic> models = new ArrayList<>();

        if (data == null) return models;
        for (TopicEntity d : data) {

            Topic m = new Topic();
            if (fields.hasField(this.asIndexer(TopicEntity._id))) m.setId(d.getId());
            if (fields.hasField(this.asIndexer(TopicEntity._size))) m.setSize(d.getSize());
            if (fields.hasField(this.asIndexer(TopicEntity._label))) m.setLabel(d.getLabel());
            if (fields.hasField(this.asIndexer(TopicEntity._wordDescription))) m.setWordDescription(d.getWordDescription());
            if (fields.hasField(this.asIndexer(TopicEntity._docsActive))) m.setDocsActive(d.getDocsActive());
            if (fields.hasField(this.asIndexer(TopicEntity._topicEntropy))) m.setTopicEntropy(d.getTopicEntropy());
            if (fields.hasField(this.asIndexer(TopicEntity._topicCoherence))) m.setTopicCoherence(d.getTopicCoherence());
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }
}
