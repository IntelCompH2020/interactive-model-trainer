package gr.cite.intelcomp.interactivemodeltrainer.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItemPersist;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.CuratingTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingTaskQueueItem;
import gr.cite.tools.logging.LoggerService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import static gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties.DockerServiceConfiguration.CACHE_DUMP_FILE_NAME;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
public class CacheLibrary extends ConcurrentHashMap<String, CachedEntity<?>> {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(CacheLibrary.class));

    private final ContainerServicesProperties containerServicesProperties;

    private final JsonHandlingService jsonHandlingService;

    private final ObjectMapper objectMapper;

    public CacheLibrary(ContainerServicesProperties containerServicesProperties, JsonHandlingService jsonHandlingService, ObjectMapper objectMapper) {
        this.containerServicesProperties = containerServicesProperties;
        this.jsonHandlingService = jsonHandlingService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct()
    public void onConstruct() {
        getUserTasksOutput();
    }

    @PreDestroy
    public void destroy() {
        persistUserTasksOutput();
    }

    public void update(CachedEntity<?> entity) {
        put(entity.getCode(), entity);
        if (UserTasksCacheEntity.CODE.equals(entity.getCode()))
            persistUserTasksOutput();
    }

    public void updateWithoutPersisting(CachedEntity<?> entity) {
        put(entity.getCode(), entity);
    }

    public void update(CachedEntity<?> entity, String key) {
        put(key, entity);
        if (UserTasksCacheEntity.CODE.equals(key))
            persistUserTasksOutput();
    }

    public void setDirtyByKey(String key) {
        if (key == null)
            return;
        CachedEntity<?> entity = get(key);
        if (entity != null)
            entity.setDirty();
    }

    public void clearByKey(String key) {
        remove(key);
    }

    public void getUserTasksOutput() {
        logger.debug("Loading user tasks cache from file...");
        File file = new File(Path.of(
                containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(),
                CACHE_DUMP_FILE_NAME
        ).toUri());
        if (!file.exists()) {
            logger.warn("No user tasks dump file found. Skipping external user tasks init.");
            return;
        }
        try {
            String json = FileUtils.readFileToString(file, Charset.defaultCharset());
            UserTasksCacheEntityPersist cacheFromFile = jsonHandlingService.fromJson(UserTasksCacheEntityPersist.class, json);
            UserTasksCacheEntity cache = new UserTasksCacheEntity();
            List<RunningTaskQueueItem> cachePayload = new ArrayList<>();
            for (RunningTaskQueueItemPersist item : cacheFromFile.getPayload()) {
                if (item.getType() == RunningTaskType.training) {
                    cachePayload.add(objectMapper.convertValue(item, TrainingTaskQueueItem.class));
                } else {
                    cachePayload.add(objectMapper.convertValue(item, CuratingTaskQueueItem.class));
                }
            }
            cache.setPayload(cachePayload);
            updateWithoutPersisting(cache);
        } catch (IOException e) {
            logger.error("Unable to get current user tasks from file.");
            logger.error(e.getMessage(), e);
        }
    }

    public void persistUserTasksOutput() {
        logger.debug("Dumping user tasks cache to file...");
        UserTasksCacheEntity cache = (UserTasksCacheEntity) get(UserTasksCacheEntity.CODE);
        if (cache == null)
            return;
        UserTasksCacheEntityPersist cacheToWrite = objectMapper.convertValue(cache, UserTasksCacheEntityPersist.class);
        if (cacheToWrite == null)
            return;
        File file = new File(Path.of(
                containerServicesProperties.getExecutionsOutputLibrary().getExecutionsOutputFolder(),
                CACHE_DUMP_FILE_NAME
        ).toUri());
        try {
            FileUtils.write(file, jsonHandlingService.toJson(cacheToWrite), Charset.defaultCharset());
        } catch (IOException e) {
            logger.error("Unable to update current user tasks to file.");
            logger.error(e.getMessage(), e);
        }
    }

}
