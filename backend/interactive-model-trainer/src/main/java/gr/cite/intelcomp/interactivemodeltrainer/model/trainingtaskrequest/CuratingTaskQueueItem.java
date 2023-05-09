package gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest;

import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;
import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskType;

public class CuratingTaskQueueItem extends RunningTaskQueueItem {

    public CuratingTaskQueueItem() {
        super(RunningTaskType.curating);
    }

}
