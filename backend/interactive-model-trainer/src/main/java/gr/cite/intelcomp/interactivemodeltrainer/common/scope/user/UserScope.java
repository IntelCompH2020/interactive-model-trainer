package gr.cite.intelcomp.interactivemodeltrainer.common.scope.user;

import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import javax.management.InvalidApplicationException;
import java.util.UUID;

@Component
@RequestScope
public class UserScope {
    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(UserScope.class));
    private  UUID userId = null;

    public Boolean isSet(){
        return this.userId != null;
    }

    public UUID getUserId() throws InvalidApplicationException {
        if (this.userId == null) throw new InvalidApplicationException("user not set");
        return this.userId;
    }

    public UUID getUserIdSafe() {
        return this.userId;
    }

    public void setUserId(UUID userId) {
        logger.trace("User scope set {}", userId);
        this.userId = userId;
    }
}

