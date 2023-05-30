package gr.cite.intelcomp.interactivemodeltrainer.cache;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

public abstract class CachedEntity<T> {

    public CachedEntity() {
        this.updatedAt = Instant.now();
    }

    private boolean dirty = false;
    private Instant updatedAt;
    private List<T> payload;

    public abstract String getCode();

    public boolean isDirty(int retentionPeriod) {
        return dirty || this.updatedAt.isBefore(Instant.now().minus(retentionPeriod, ChronoUnit.SECONDS));
    }

    public void setDirty() {
        this.dirty = true;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<T> getPayload() {
        return payload;
    }

    public void setPayload(List<T> payload) {
        this.payload = payload;
        this.updatedAt = Instant.now();
    }
}
