package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItem;

public class UserTasksCacheEntity extends CachedEntity<RunningTaskQueueItem>{
    public static final String CODE = "RUNNING_TASKS_QUEUE";
    @Override
    public String getCode() {
        return CODE;
    }
}
