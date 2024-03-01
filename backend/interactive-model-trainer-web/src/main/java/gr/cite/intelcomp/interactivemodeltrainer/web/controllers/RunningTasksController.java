package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.cache.CacheLibrary;
import gr.cite.intelcomp.interactivemodeltrainer.cache.UserTasksCacheEntity;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.data.DocumentEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskSubType;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "api/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
public class RunningTasksController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunningTasksController.class));

    private final TrainingTaskRequestService trainingTaskRequestService;

    private final CacheLibrary cacheLibrary;

    @Autowired
    public RunningTasksController(TrainingTaskRequestService trainingTaskRequestService, CacheLibrary cacheLibrary) {
        this.trainingTaskRequestService = trainingTaskRequestService;
        this.cacheLibrary = cacheLibrary;
    }

    @GetMapping("{task}/status")
    public TrainingTaskRequestStatus getTaskStatus(@PathVariable(name = "task") UUID task) {
        return trainingTaskRequestService.getTaskStatus(task);
    }

    @GetMapping("{task}/clear")
    public void clearFinishedTask(@PathVariable(name = "task") UUID task) {
        if (task != null)
            trainingTaskRequestService.clearFinishedTask(task);
    }

    @GetMapping("{task}/cancel")
    public void cancelTask(@PathVariable(name = "task") UUID task) {
        if (task != null)
            trainingTaskRequestService.cancelTask(task);
    }

    @GetMapping("{task}/pu-scores/{image}")
    public ResponseEntity<byte[]> getPU_scores(@PathVariable(name = "task") String task, @PathVariable(name = "image") String image) {
        try {
            UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
            if (cache == null || cache.getPayload() == null || cache.getPayload().isEmpty())
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            for (RunningTaskQueueItem item : cache.getPayload()) {
                if (!item.getTask().toString().equals(task) || !item.getSubType().equals(RunningTaskSubType.EVALUATE_DOMAIN_MODEL))
                    continue;
                return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(item.getResponse().getPuScores().get(image));
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("{task}/pu-scores/all")
    public QueryResult<String> getPU_scores(@PathVariable(name = "task") String task) {
        try {
            UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
            if (cache == null || cache.getPayload() == null || cache.getPayload().isEmpty())
                return new QueryResult<>(new ArrayList<>());
            for (RunningTaskQueueItem item : cache.getPayload()) {
                if (!item.getTask().toString().equals(task) || !item.getSubType().equals(RunningTaskSubType.EVALUATE_DOMAIN_MODEL))
                    continue;
                ArrayList<String> images = new ArrayList<>();
                item.getResponse().getPuScores().forEach((key, val) -> {
                    images.add(key);
                });
                return new QueryResult<String>(images);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new QueryResult<>(new ArrayList<>());
        }
        return new QueryResult<>(new ArrayList<>());
    }

    @GetMapping("{task}/documents")
    public QueryResult<DocumentEntity> getSampledDocuments(@PathVariable(name = "task") String task) {
        try {
            UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
            if (cache == null || cache.getPayload() == null || cache.getPayload().isEmpty())
                return new QueryResult<>(List.of());
            for (RunningTaskQueueItem item : cache.getPayload()) {
                if (!item.getTask().toString().equals(task) || !item.getSubType().equals(RunningTaskSubType.SAMPLE_DOMAIN_MODEL))
                    continue;
                return new QueryResult<>(item.getResponse().getDocuments());
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new QueryResult<>(List.of());
        }
        return new QueryResult<>(List.of());
    }

    @GetMapping("{task}/logs")
    public QueryResult<String> getLogs(@PathVariable(name = "task") String task) {
        try {
            UserTasksCacheEntity cache = (UserTasksCacheEntity) cacheLibrary.get(UserTasksCacheEntity.CODE);
            if (cache == null || cache.getPayload() == null || cache.getPayload().isEmpty())
                return new QueryResult<>(List.of());
            for (RunningTaskQueueItem item : cache.getPayload()) {
                if (!item.getTask().toString().equals(task) || item.getResponse().getLogs() == null)
                    continue;
                return new QueryResult<>(item.getResponse().getLogs());
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new QueryResult<>(List.of());
        }
        return new QueryResult<>(List.of());
    }

    @GetMapping("{type}/clear-all")
    public void clearAllFinishedTasks(@PathVariable("type") RunningTaskType type) {
        if (type != null)
            trainingTaskRequestService.clearAllFinishedTasks(type);
    }

    @GetMapping("{type}/running")
    public QueryResult<? extends RunningTaskQueueItem> getRunningTasks(@PathVariable("type") RunningTaskType type) throws JsonProcessingException {
        List<? extends RunningTaskQueueItem> items = trainingTaskRequestService.getRunningTasks(type);
        if (items == null)
            return new QueryResult<>(List.of());
        return new QueryResult<>(items);
    }

}
