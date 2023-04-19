package gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest;

import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;

public class TrainingTaskQueueItem extends RunningTaskQueueItem {

    public TrainingTaskQueueItem() {
        super(RunningTaskType.training);
    }

}
