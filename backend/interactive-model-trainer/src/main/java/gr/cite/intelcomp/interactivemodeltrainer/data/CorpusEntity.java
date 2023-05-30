package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

@MappedSuperclass
public class CorpusEntity {

    @Id
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;
    public final static String _id = "id";

    @Column(name = "name", length = 100, nullable = false)
    private String name;
    public final static String _name = "name";

    @Column(name = "description", length = 100)
    private String description;
    public final static String _description = "description";

    @Column(name = "visibility", length = 100)
    @Enumerated(EnumType.STRING)
    private Visibility visibility;
    public final static String _visibility = "visibility";

    @Column(name = "creator")
    private String creator;
    public static final String _creator = "creator";

    @Column(name = "location")
    private String location;
    public static final String _location = "location";

    @Column(name = "creation_date", nullable = false)
    private Date creation_date;
    public final static String _creation_date = "creation_date";

    @Column(name = "valid_for", nullable = false)
    private CorpusValidFor valid_for;
    public final static String _valid_for = "valid_for";

    @Column(name = "type")
    private CorpusType type;
    public static final String _type = "type";

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

    public String getCreator() {
        if (creator != null) return creator.trim();
        return null;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Date getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }

    public CorpusValidFor getValid_for() {
        return valid_for;
    }

    public void setValid_for(CorpusValidFor valid_for) {
        this.valid_for = valid_for;
    }

    public CorpusType getType() {
        return type;
    }

    public void setType(CorpusType type) {
        this.type = type;
    }
}
