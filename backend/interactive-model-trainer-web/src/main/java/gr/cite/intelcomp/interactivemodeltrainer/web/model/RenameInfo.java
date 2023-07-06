package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import jakarta.validation.constraints.NotBlank;

public class RenameInfo {

    @NotBlank()
    private String oldName;
    @NotBlank()
    private String newName;

    public String getOldName() {
        return oldName;
    }
    public void setOldName(String oldName) {
        this.oldName = oldName;
    }

    public String getNewName() {
        return newName;
    }
    public void setNewName(String newName) {
        this.newName = newName;
    }
}
