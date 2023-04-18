package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.TrainingTaskRequestStatus;
import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.service.trainingtaskrequest.TrainingTaskRequestService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        trainingTaskRequestService.clearFinishedTask(task);
    }

    @GetMapping("clear-all")
    public void clearAllFinishedTasks() {
        trainingTaskRequestService.clearAllFinishedTasks();
    }

    @GetMapping("running")
    public QueryResult<TrainingQueueItem> getRunningTasks() throws JsonProcessingException {
        List<TrainingQueueItem> items = trainingTaskRequestService.getRunningTasks();
        return new QueryResult<>(items);
    }

}
