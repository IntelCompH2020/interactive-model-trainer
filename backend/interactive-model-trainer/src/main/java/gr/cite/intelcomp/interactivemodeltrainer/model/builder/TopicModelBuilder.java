package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.TopicModelListingEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.TopicModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.TopicModelListing;
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

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class TopicModelBuilder extends BaseBuilder<TopicModelListing, TopicModelListingEntity> implements SortableByOwner<TopicModelListing, TopicModelListingEntity> {

    private final CacheLibrary cacheLibrary;

    @Autowired
    public TopicModelBuilder(ConventionService conventionService, CacheLibrary cacheLibrary) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(TopicModelBuilder.class)));
        this.cacheLibrary = cacheLibrary;
    }

    @Override
    public List<TopicModelListing> build(FieldSet fields, List<TopicModelListingEntity> data) throws MyApplicationException {
        return List.of();
    }

    @Override
    public List<TopicModelListing> build(FieldSet fields, List<TopicModelListingEntity> data, List<UserEntity> users) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty()) return new ArrayList<>();

        List<TopicModelListing> models = new ArrayList<>(100);

        if (data == null) return models;
        for (TopicModelListingEntity d : data) {

            if (modelIsTraining(d)) continue;

            TopicModelListing m = new TopicModelListing();
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._id)))
                m.setId(d.getId());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._name)))
                m.setName(d.getName());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._description)))
                m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._visibility)))
                m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._trainer)))
                m.setTrainer(d.getTrainer());
            if (fields.hasField(this.asIndexer(TopicModelEntity._corpus)))
                m.setCorpus(extractCorpusName(d.getCorpus()));
            if (fields.hasField(this.asIndexer(TopicModelEntity._creator)))
                m.setCreator(extractUsername(d.getCreator(), users));
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._params)))
                m.setParams(d.getParams());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._location)))
                m.setLocation(d.getLocation());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._hierarchy_level)))
                m.setHierarchyLevel(d.getHierarchyLevel());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._creation_date)))
                m.setCreation_date(d.getCreation_date());
            if (fields.hasField(this.asIndexer(TopicModelListingEntity._submodels)))
                m.setSubmodels(d.getSubmodels().stream().map(TopicModelBuilder::fromEntity).collect(Collectors.toList()));
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }

    private static TopicModel fromEntity(TopicModelEntity entity) {
        TopicModel result = new TopicModel();
        result.setId(entity.getId());
        result.setCorpus(entity.getCorpus());
        result.setCorpus(extractCorpusName(entity.getCorpus()));
        result.setCreator(entity.getCreator());
        result.setDescription(entity.getDescription());
        result.setHierarchyLevel(entity.getHierarchyLevel());
        result.setParams(entity.getParams());
        result.setTrainer(entity.getTrainer());
        result.setLocation(entity.getLocation());
        result.setName(entity.getName());
        result.setCreation_date(entity.getCreation_date());
        result.setVisibility(entity.getVisibility());
        return result;
    }

    private static String extractCorpusName(String from) {
        return from.replaceAll("^(.*)/", "")
                .replace("Subcorpus created from ", "")
                .replace(".json", "");
    }

    private boolean modelIsTraining(TopicModelEntity model) {
        AtomicBoolean result = new AtomicBoolean(false);
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && !cache.getPayload().isEmpty()) {
            cache.getPayload().forEach((item) -> {
                if (item.getType() == RunningTaskType.training &&
                        (item.getSubType() == RunningTaskSubType.RUN_ROOT_TOPIC_TRAINING || item.getSubType() == RunningTaskSubType.RUN_HIERARCHICAL_TOPIC_TRAINING) &&
                        item.getLabel().equals(model.getName()))
                    result.set(true);
            });
        }
        return result.get();
    }

    @Override
    public List<TopicModelListing> buildSortedByOwnerAsc(FieldSet directives, List<TopicModelListingEntity> data) {
        return null;
    }

    @Override
    public List<TopicModelListing> buildSortedByOwnerAsc(FieldSet directives, List<TopicModelListingEntity> data, List<UserEntity> users) {
        Comparator<TopicModelListing> byOwner = Comparator.comparing(TopicModelListing::getCreator);
        return build(directives, data, users).stream().sorted(byOwner).toList();
    }

    @Override
    public List<TopicModelListing> buildSortedByOwnerDesc(FieldSet directives, List<TopicModelListingEntity> data) {
        return null;
    }

    @Override
    public List<TopicModelListing> buildSortedByOwnerDesc(FieldSet directives, List<TopicModelListingEntity> data, List<UserEntity> users) {
        Comparator<TopicModelListing> byOwner = Comparator.comparing(TopicModelListing::getCreator);
        return build(directives, data, users).stream().sorted(byOwner.reversed()).toList();
    }
}
