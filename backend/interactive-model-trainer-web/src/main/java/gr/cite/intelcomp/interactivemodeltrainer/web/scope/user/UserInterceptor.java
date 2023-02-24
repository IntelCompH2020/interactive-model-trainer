package gr.cite.intelcomp.interactivemodeltrainer.web.scope.user;


import gr.cite.commons.web.oidc.principal.CurrentPrincipalResolver;
import gr.cite.commons.web.oidc.principal.extractor.ClaimExtractor;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.locale.LocaleService;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.ui.ModelMap;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.WebRequestInterceptor;

import javax.management.InvalidApplicationException;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class UserInterceptor implements WebRequestInterceptor {
	private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(UserInterceptor.class));
	private final UserScope userScope;
	private final ClaimExtractor claimExtractor;
	private final CurrentPrincipalResolver currentPrincipalResolver;
	private final LocaleService localeService;
	private final PlatformTransactionManager transactionManager;
	private final UserInterceptorCacheService userInterceptorCacheService;
	@PersistenceContext
	public EntityManager entityManager;

	@Autowired
	public UserInterceptor(
			UserScope userScope,
			LocaleService localeService,
			ClaimExtractor claimExtractor,
			CurrentPrincipalResolver currentPrincipalResolver,
			PlatformTransactionManager transactionManager,
			UserInterceptorCacheService userInterceptorCacheService
	) {
		this.userScope = userScope;
		this.localeService = localeService;
		this.currentPrincipalResolver = currentPrincipalResolver;
		this.claimExtractor = claimExtractor;
		this.transactionManager = transactionManager;
		this.userInterceptorCacheService = userInterceptorCacheService;
	}

	@Override
	public void preHandle(WebRequest request) throws InvalidApplicationException {
		UUID userId = null;
		if (this.currentPrincipalResolver.currentPrincipal().isAuthenticated()) {
			String subjectId = this.claimExtractor.subjectString(this.currentPrincipalResolver.currentPrincipal());

			UserInterceptorCacheService.UserInterceptorCacheValue cacheValue = this.userInterceptorCacheService.lookup(this.userInterceptorCacheService.buildKey(subjectId));
			if (cacheValue != null) {
				userId = cacheValue.getUserId();
			} else {
				userId = this.getUserIdFromDatabase(subjectId);
				if (userId == null) userId = this.createUser(subjectId);

				this.userInterceptorCacheService.put(new UserInterceptorCacheService.UserInterceptorCacheValue(subjectId, userId));
			}
		}
		this.userScope.setUserId(userId);
	}

	private UUID getUserIdFromDatabase(String subjectId) throws InvalidApplicationException {
		CriteriaBuilder criteriaBuilder = this.entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = criteriaBuilder.createQuery(Tuple.class);
		Root<UserEntity> root = query.from(UserEntity.class);
		query.where(
				criteriaBuilder.and(
						criteriaBuilder.equal(root.get(UserEntity._subjectId), subjectId),
						criteriaBuilder.equal(root.get(UserEntity._isActive), IsActive.ACTIVE)
				));

		query.multiselect(root.get(UserEntity._id).alias(UserEntity._id));

		List<Tuple> results = this.entityManager.createQuery(query).getResultList();
		if (results.size() == 1) {
			Object o;
			try {
				o = results.get(0).get(UserEntity._id);
			} catch (IllegalArgumentException e) {
				return null;
			}
			if (o == null) return null;
			try {
				return UUID.class.cast(o);
			} catch (ClassCastException e) {
				return null;
			}
		}
		return null;
	}

	private UUID createUser(String subjectId) {
		String name = this.claimExtractor.name(this.currentPrincipalResolver.currentPrincipal());
		String familyName = this.claimExtractor.familyName(this.currentPrincipalResolver.currentPrincipal());
		if (name == null) name = subjectId;
		UserEntity user = new UserEntity();
		user.setId(UUID.randomUUID());
		user.setCreatedAt(Instant.now());
		user.setUpdatedAt(Instant.now());
		user.setFirstName(name);
		user.setLastName(familyName == null ? name : familyName);
		user.setIsActive(IsActive.ACTIVE);
		user.setSubjectId(subjectId);
		user.setCulture(this.localeService.cultureName());
		user.setTimezone(this.localeService.timezoneName());
		user.setLanguage(this.localeService.language());

		DefaultTransactionDefinition definition = new DefaultTransactionDefinition();
		definition.setName(UUID.randomUUID().toString());
		definition.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
		definition.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
		TransactionStatus status = null;
		try {
			status = transactionManager.getTransaction(definition);
			this.entityManager.persist(user);

			this.entityManager.flush();
			transactionManager.commit(status);
		} catch (Exception ex) {
			if (status != null) transactionManager.rollback(status);
			throw ex;
		}
		return user.getId();
	}

	@Override
	public void postHandle(@NonNull WebRequest request, ModelMap model) {
		this.userScope.setUserId(null);
	}

	@Override
	public void afterCompletion(@NonNull WebRequest request, Exception ex) {
	}
}
