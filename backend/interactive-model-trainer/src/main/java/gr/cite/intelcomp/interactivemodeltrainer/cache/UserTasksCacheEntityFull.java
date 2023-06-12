package gr.cite.intelcomp.interactivemodeltrainer.cache;

import gr.cite.intelcomp.interactivemodeltrainer.model.taskqueue.RunningTaskQueueItemFull;

public class UserTasksCacheEntityFull extends CachedEntity<RunningTaskQueueItemFull>{
    public final String code = "RUNNING_TASKS_QUEUE";
    @Override
    public String getCode() {
        return code;
    }
}
