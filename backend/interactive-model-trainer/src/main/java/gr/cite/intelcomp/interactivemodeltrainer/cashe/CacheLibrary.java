package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
public class CacheLibrary extends ConcurrentHashMap<String, CachedEntity<?>> {

    public void update(CachedEntity<?> entity) {
        put(entity.getCode(), entity);
    }

    public void update(CachedEntity<?> entity, String key) {
        put(key, entity);
    }

    public void setDirtyByKey(String key) {
        CachedEntity<?> entity = get(key);
        if (entity != null) entity.setDirty(true);
    }

    public void clearByKey(String key) {
        remove(key);
    }

}
