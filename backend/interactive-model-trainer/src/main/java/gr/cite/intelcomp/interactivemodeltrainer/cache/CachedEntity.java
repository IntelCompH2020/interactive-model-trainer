package gr.cite.intelcomp.interactivemodeltrainer.cache;

import java.util.List;

public abstract class CachedEntity<T> {
    private boolean dirty = false;
    private List<T> payload;

    public abstract String getCode();

    public boolean isDirty() {
        return dirty;
    }

    public void setDirty(boolean dirty) {
        this.dirty = dirty;
    }

    public List<T> getPayload() {
        return payload;
    }

    public void setPayload(List<T> payload) {
        this.payload = payload;
    }
}
