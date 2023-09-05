package gr.cite.intelcomp.interactivemodeltrainer.web.scope.user;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.intelcomp.interactivemodeltrainer.event.UserTouchedEvent;
import gr.cite.tools.cache.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.UUID;

@Service
public class UserInterceptorCacheService extends CacheService<UserInterceptorCacheService.UserInterceptorCacheValue> {

    public static class UserInterceptorCacheValue {

        public UserInterceptorCacheValue() {
        }

        public UserInterceptorCacheValue(String subjectId, UUID userId) {
            this.subjectId = subjectId;
            this.userId = userId;
        }

        private String subjectId;

        public String getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(String subjectId) {
            this.subjectId = subjectId;
        }

        private UUID userId;

        public UUID getUserId() {
            return userId;
        }

        public void setUserId(UUID userId) {
            this.userId = userId;
        }
    }

    private final ConventionService conventionService;

    @Autowired
    public UserInterceptorCacheService(UserInterceptorCacheOptions options, ConventionService conventionService) {
        super(options);
        this.conventionService = conventionService;
    }

    @EventListener
    public void handleUserTouchedEvent(UserTouchedEvent event) {
        if (!this.conventionService.isNullOrEmpty(event.getSubjectId()))
            this.evict(this.buildKey(event.getSubjectId()));
        if (!this.conventionService.isNullOrEmpty(event.getPreviousSubjectId()))
            this.evict(this.buildKey(event.getPreviousSubjectId()));
    }

    @Override
    protected Class<UserInterceptorCacheValue> valueClass() {
        return UserInterceptorCacheValue.class;
    }

    @Override
    public String keyOf(UserInterceptorCacheValue value) {
        return this.buildKey(value.getSubjectId());
    }


    public String buildKey(String subject) {
		HashMap<String, String> keyParts = new HashMap<>();
		keyParts.put("$subject$", subject);
        return this.generateKey(keyParts);
    }
}
