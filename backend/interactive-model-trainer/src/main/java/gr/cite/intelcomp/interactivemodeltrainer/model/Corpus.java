package gr.cite.intelcomp.interactivemodeltrainer.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class Corpus {

    public final static String _id = "id";
    private UUID id;

    public static final String _name = "name";
    @NotBlank
    private String name;

    public static final String _description = "description";
    private String description;

    public static final String _visibility = "visibility";
    private Visibility visibility;

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public Visibility getVisibility() {
        return visibility;
    }
    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

}
