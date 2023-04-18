package gr.cite.intelcomp.interactivemodeltrainer.cashe;

import gr.cite.intelcomp.interactivemodeltrainer.model.trainingtaskrequest.TrainingQueueItem;

public class UserTasksCacheEntity extends CachedEntity<TrainingQueueItem>{
    public static final String CODE = "TRAINING_QUEUE";
    @Override
    public String getCode() {
        return CODE;
    }
}
