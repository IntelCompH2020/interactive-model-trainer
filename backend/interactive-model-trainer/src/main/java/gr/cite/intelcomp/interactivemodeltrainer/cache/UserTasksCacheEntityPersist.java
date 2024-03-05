package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItemPersist;

public class UserTasksCacheEntityPersist extends CachedEntity<RunningTaskQueueItemPersist>{
    public final String code = "RUNNING_TASKS_QUEUE";
    @Override
    public String getCode() {
        return code;
    }
}
