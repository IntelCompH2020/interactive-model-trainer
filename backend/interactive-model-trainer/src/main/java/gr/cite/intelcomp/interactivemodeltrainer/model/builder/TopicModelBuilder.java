package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.TopicModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskSubType;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
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
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class TopicModelBuilder extends BaseBuilder<TopicModel, TopicModelEntity> {

    private final CacheLibrary cacheLibrary;

    @Autowired
    public TopicModelBuilder(ConventionService conventionService, CacheLibrary cacheLibrary) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(TopicModelBuilder.class)));
        this.cacheLibrary = cacheLibrary;
    }

    @Override
    public List<TopicModel> build(FieldSet fields, List<TopicModelEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<TopicModel> models = new ArrayList<>();

        if (data == null) return models;
        for (TopicModelEntity d : data) {

            if (modelIsTraining(d)) continue;

            TopicModel m = new TopicModel();
            if (fields.hasField(this.asIndexer(TopicModelEntity._id))) m.setId(d.getId());
            if (fields.hasField(this.asIndexer(TopicModelEntity._name))) m.setName(d.getName());
            if (fields.hasField(this.asIndexer(TopicModelEntity._description))) m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(TopicModelEntity._visibility))) m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(TopicModelEntity._trainer))) m.setTrainer(d.getTrainer());
            if (fields.hasField(this.asIndexer(TopicModelEntity._corpus))) m.setCorpus(
                    d.getCorpus()
                            .replaceAll("^(.*)/", "")
                            .replace("Subcorpus created from ", "")
                            .replace(".json", "")
            );
            if (fields.hasField(this.asIndexer(TopicModelEntity._creator))) m.setCreator(d.getCreator());
            if (fields.hasField(this.asIndexer(TopicModelEntity._params))) m.setParams(d.getParams());
            if (fields.hasField(this.asIndexer(TopicModelEntity._location))) m.setLocation(d.getLocation());
            if (fields.hasField(this.asIndexer(TopicModelEntity._creation_date))) m.setCreation_date(d.getCreation_date());
            m.setHierarchyLevel(d.getHierarchyLevel());
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }

    private boolean modelIsTraining(TopicModelEntity model) {
        AtomicBoolean result = new AtomicBoolean(false);
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && !cache.getPayload().isEmpty()) {
            cache.getPayload().forEach((item) -> {
                if (item.getType().equals(RunningTaskType.training) &&
                        (item.getSubType().equals(RunningTaskSubType.RUN_ROOT_TOPIC_TRAINING) || item.getSubType().equals(RunningTaskSubType.RUN_HIERARCHICAL_TOPIC_TRAINING)) &&
                        item.getLabel().equals(model.getName()))
                    result.set(true);
            });
        }
        return result.get();
    }
}
