package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.tools.data.builder.Builder;
import gr.cite.tools.data.query.QueryBase;
import gr.cite.tools.exception.MyApplicationException;
import gr.cite.tools.fieldset.FieldSet;
import gr.cite.tools.logging.LoggerService;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public abstract class BaseBuilder<M, D> implements Builder {
	protected final LoggerService logger;
	protected final ConventionService conventionService;

	public BaseBuilder(
			ConventionService conventionService,
			LoggerService logger
	) {
		this.conventionService = conventionService;
		this.logger = logger;
	}

	public M build(FieldSet directives, D data) throws MyApplicationException {
		if (data == null) {
			//this.logger.Debug(new MapLogEntry("requested build for null item requesting fields").And("fields", directives));
//			return default(M);
			M model = null;
			return null; //TODO
		}
		List<M> models = this.build(directives, List.of(data));
		return models.stream().findFirst().orElse(null); //TODO
	}

	public abstract List<M> build(FieldSet directives, List<D> data) throws MyApplicationException;

	public <K> Map<K, M> asForeignKey(QueryBase<D> query, FieldSet directives, Function<M, K> keySelector) throws MyApplicationException {
		this.logger.trace("Building references from query");
		List<D> data = query.collectAs(directives);
		this.logger.trace("collected {} items to build", Optional.ofNullable(data).map(List::size).orElse(0));
		return this.asForeignKey(data, directives, keySelector);
	}

	public <K> Map<K, M> asForeignKey(List<D> data, FieldSet directives, Function<M, K> keySelector) throws MyApplicationException {
		this.logger.trace("building references");
		List<M> models = this.build(directives, data);
		this.logger.trace("mapping {} build items from {} requested", Optional.ofNullable(models).map(List::size).orElse(0), Optional.ofNullable(data).map(List::size).orElse(0));
		assert models != null;
		return models.stream().collect(Collectors.toMap(keySelector, o -> o));
	}

	public <K> Map<K, List<M>> asMasterKey(QueryBase<D> query, FieldSet directives, Function<M, K> keySelector) throws MyApplicationException {
		this.logger.trace("Building details from query");
		List<D> data = query.collectAs(directives);
		this.logger.trace("collected {} items to build", Optional.ofNullable(data).map(List::size).orElse(0));
		return this.asMasterKey(data, directives, keySelector);
	}

	public <K> Map<K, List<M>> asMasterKey(List<D> data, FieldSet directives, Function<M, K> keySelector) throws MyApplicationException {
		this.logger.trace("building details");
		List<M> models = this.build(directives, data);
		this.logger.trace("mapping {} build items from {} requested", Optional.ofNullable(models).map(List::size).orElse(0), Optional.ofNullable(data).map(List::size).orElse(0));
		Map<K, List<M>> map = new HashMap<>();
		assert models != null;
		for (M model : models) {
			K key = keySelector.apply(model);
			if (!map.containsKey(key)) map.put(key, new ArrayList<M>());
			map.get(key).add(model);
		}
		return map;
	}

	public <FK, FM> Map<FK, FM> asEmpty(List<FK> keys, Function<FK, FM> mapper, Function<FM, FK> keySelector) {
		this.logger.trace("building static references");
		List<FM> models = keys.stream().map(mapper).collect(Collectors.toList());
		this.logger.trace("mapping {} build items from {} requested", Optional.of(models).map(List::size).orElse(0), Optional.of(keys).map(x -> x.size()));
		return models.stream().collect(Collectors.toMap(keySelector, o -> o));
	}

	protected String hashValue(Instant value) throws MyApplicationException {
		return this.conventionService.hashValue(value);
	}

	protected String asPrefix(String name) {
		return this.conventionService.asPrefix(name);
	}

	protected String asIndexer(String... names) {
		return this.conventionService.asIndexer(names);
	}

	public static String extractUsername(String id, List<UserEntity> users) {
		Optional<UserEntity> found = users.stream().filter(user ->
				user.getId().equals(UUID.fromString(id)) || user.getSubjectId().equals(id)
		).findFirst();
		return found.map(UserEntity::getFirstName).orElse("-");
	}

}
