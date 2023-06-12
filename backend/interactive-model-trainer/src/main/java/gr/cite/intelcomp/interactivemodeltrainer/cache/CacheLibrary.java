package gr.cite.intelcomp.interactivemodeltrainer.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItemFull;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.CuratingTaskQueueItem;
import gr.cite.tools.logging.LoggerService;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
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

    private final JsonHandlingService jsonHandlingService;
    private final ContainerServicesProperties containerServicesProperties;

    public CacheLibrary(JsonHandlingService jsonHandlingService, ContainerServicesProperties containerServicesProperties) {
        this.jsonHandlingService = jsonHandlingService;
        this.containerServicesProperties = containerServicesProperties;
    }

    @PostConstruct()
    public void onConstruct() {
        File file = new File(Path.of(
                containerServicesProperties.getTopicTrainingService().getTempFolder(),
                CACHE_DUMP_FILE_NAME
        ).toUri());
        try {
            String json = FileUtils.readFileToString(file, Charset.defaultCharset());
            if (json != null && !json.isBlank()) {
                UserTasksCacheEntityFull cache = jsonHandlingService.fromJson(UserTasksCacheEntityFull.class, json);
                UserTasksCacheEntity cacheToBeSet = new UserTasksCacheEntity();
                List<RunningTaskQueueItem> payload = new ArrayList<>();
                for (RunningTaskQueueItemFull cacheItem : cache.getPayload()) {
                    ObjectMapper mapper = new ObjectMapper();
                    mapper.registerModule(new JavaTimeModule());
                    if (cacheItem.getType().equals(RunningTaskType.curating)) {
                        CuratingTaskQueueItem item = mapper.convertValue(cacheItem, CuratingTaskQueueItem.class);
                        item.setUserId(cacheItem.getUserId());
                        item.getResponse().setDocuments(cacheItem.getResponse().getDocuments());
                        item.getResponse().setPuScores(cacheItem.getResponse().getPuScores());
                        payload.add(item);
                    }
                }
                cacheToBeSet.setPayload(payload);
                update(cacheToBeSet);
            }
        } catch (IOException e) {
            logger.warn("Unable to initialize user tasks cache from dump file.");
            logger.warn("Message: {}", e.getMessage());
            return;
        }
        logger.info("User tasks cache initialized.");
    }

    public void update(CachedEntity<?> entity) {
        put(entity.getCode(), entity);
    }

    public void update(CachedEntity<?> entity, String key) {
        put(key, entity);
    }

    public void setDirtyByKey(String key) {
        if (key == null) return;
        CachedEntity<?> entity = get(key);
        if (entity != null) entity.setDirty();
    }

    public void clearByKey(String key) {
        remove(key);
    }

}
