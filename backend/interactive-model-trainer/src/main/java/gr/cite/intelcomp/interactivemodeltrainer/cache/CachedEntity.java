package gr.cite.intelcomp.interactivemodeltrainer.cache;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

public abstract class CachedEntity<T> {

    public CachedEntity() {
        this.updatedAt = Instant.now();
    }

    @JsonCreator
    public CachedEntity(boolean dirty, Instant updatedAt, List<T> payload) {
        this.dirty = dirty;
        this.updatedAt = updatedAt;
        this.payload = payload;
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
