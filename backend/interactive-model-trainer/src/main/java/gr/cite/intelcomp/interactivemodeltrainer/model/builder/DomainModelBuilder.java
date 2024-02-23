package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.DomainModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskSubType;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
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
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class DomainModelBuilder extends BaseBuilder<DomainModel, DomainModelEntity> implements SortableByOwner<DomainModel, DomainModelEntity> {

    private final CacheLibrary cacheLibrary;

    private final ApplicationContext applicationContext;

    @Autowired
    public DomainModelBuilder(ConventionService conventionService, CacheLibrary cacheLibrary, ApplicationContext applicationContext) {
        super(conventionService, new LoggerService(LoggerFactory.getLogger(DomainModelBuilder.class)));
        this.cacheLibrary = cacheLibrary;
        this.applicationContext = applicationContext;
    }

    @Override
    public List<DomainModel> build(FieldSet fields, List<DomainModelEntity> data) throws MyApplicationException {
        this.logger.trace("building for {} items requesting {} fields", Optional.ofNullable(data).map(List::size).orElse(0), Optional.ofNullable(fields).map(FieldSet::getFields).map(Set::size).orElse(0));
        this.logger.trace(new DataLogEntry("requested fields", fields));
        if (fields == null || fields.isEmpty())
            return new ArrayList<>();

        List<DomainModel> models = new ArrayList<>(100);

        List<UserEntity> users = applicationContext.getBean(UserQuery.class).collect();

        if (data == null)
            return models;
        for (DomainModelEntity d : data) {
            if (modelIsTraining(d))
                continue;

            DomainModel m = new DomainModel();
            if (fields.hasField(this.asIndexer(DomainModelEntity._id)))
                m.setId(d.getId());
            if (fields.hasField(this.asIndexer(DomainModelEntity._name)))
                m.setName(d.getName());
            if (fields.hasField(this.asIndexer(DomainModelEntity._description)))
                m.setDescription(d.getDescription());
            if (fields.hasField(this.asIndexer(DomainModelEntity._tag)))
                m.setTag(d.getTag());
            if (fields.hasField(this.asIndexer(DomainModelEntity._visibility)))
                m.setVisibility(d.getVisibility());
            if (fields.hasField(this.asIndexer(DomainModelEntity._corpus)))
                m.setCorpus(
                        d.getCorpus()
                                .replaceAll("^(.*)/", "")
                                .replace(".json", "")
                );
            if (fields.hasField(this.asIndexer(DomainModelEntity._creator)))
                m.setCreator(extractUsername(d.getCreator(), users));
            if (fields.hasField(this.asIndexer(DomainModelEntity._location)))
                m.setLocation(d.getLocation());
            if (fields.hasField(this.asIndexer(DomainModelEntity._creation_date)))
                m.setCreation_date(d.getCreation_date());
            models.add(m);
        }
        this.logger.trace("build {} items", Optional.of(models).map(List::size).orElse(0));
        return models;
    }

    private boolean modelIsTraining(DomainModelEntity model) {
        AtomicBoolean result = new AtomicBoolean(false);
        UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
        if (cache != null && !cache.getPayload().isEmpty()) {
            cache.getPayload().forEach((item) -> {
                if (item.getType() == RunningTaskType.training &&
                        !item.isFinished() &&
                        item.getSubType() == RunningTaskSubType.RUN_ROOT_DOMAIN_TRAINING &&
                        item.getLabel().equals(model.getName()))
                    result.set(true);
            });
        }
        return result.get();
    }

    @Override
    public List<DomainModel> buildSortedByOwnerAsc(FieldSet directives, List<DomainModelEntity> data) {
        Comparator<DomainModel> byOwner = Comparator.comparing(DomainModel::getCreator);
        return build(directives, data).stream().sorted(byOwner).toList();
    }

    @Override
    public List<DomainModel> buildSortedByOwnerDesc(FieldSet directives, List<DomainModelEntity> data) {
        Comparator<DomainModel> byOwner = Comparator.comparing(DomainModel::getCreator);
        return build(directives, data).stream().sorted(byOwner.reversed()).toList();
    }
}
