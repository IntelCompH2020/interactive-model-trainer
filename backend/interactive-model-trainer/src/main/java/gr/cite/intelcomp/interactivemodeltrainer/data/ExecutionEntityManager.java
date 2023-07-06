package gr.cite.intelcomp.interactivemodeltrainer.data;

import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.UUID;

@Service
@RequestScope
public class ExecutionEntityManager {
    @PersistenceContext
    private EntityManager entityManager;

    public ExecutionEntityManager(){}

    public void persist(Object entity) {
        this.entityManager.persist(entity);
    }

    public <T> T merge(T entity){
        return this.entityManager.merge(entity);
    }

    public void remove(Object entity){
        this.entityManager.remove(entity);
    }

    public void flush() {
        this.entityManager.flush();
    }

    public ExecutionEntity find(UUID id) {
        return this.entityManager.find(ExecutionEntity.class, id);
    }
}
