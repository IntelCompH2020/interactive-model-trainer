package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "api/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
public class RunningTasksController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RunningTasksController.class));

    private final TrainingTaskRequestService trainingTaskRequestService;

    @Autowired
    public RunningTasksController(TrainingTaskRequestService trainingTaskRequestService) {
        this.trainingTaskRequestService = trainingTaskRequestService;
    }

    @GetMapping("{task}/status")
    public TrainingTaskRequestStatus getTaskStatus(@PathVariable(name = "task") UUID task) {
        return trainingTaskRequestService.getTaskStatus(task);
    }

    @GetMapping("{task}/clear")
    public void clearFinishedTask(@PathVariable(name = "task") UUID task) {
        if (task != null) trainingTaskRequestService.clearFinishedTask(task);
    }

    @GetMapping("{task}/cancel")
    public void cancelTask(@PathVariable(name = "task") UUID task) {
        if (task != null) trainingTaskRequestService.cancelTask(task);
    }

    @GetMapping("{type}/clear-all")
    public void clearAllFinishedTasks(@PathVariable("type") RunningTaskType type) {
        if (type != null) trainingTaskRequestService.clearAllFinishedTasks(type);
    }

    @GetMapping("{type}/running")
    public QueryResult<? extends RunningTaskQueueItem> getRunningTasks(@PathVariable("type") RunningTaskType type) throws JsonProcessingException {
        List<? extends RunningTaskQueueItem> items = trainingTaskRequestService.getRunningTasks(type);
        return new QueryResult<>(items);
    }

}
