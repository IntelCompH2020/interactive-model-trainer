package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.WordlistType;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "word_list")
public class WordListEntity {
    @Id
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;
    public final static String _id = "id";

    @Column(name = "name", length = 100, nullable = false)
    private String name;
    public final static String _name = "name";

    @Column(name = "valid_for", length = 100)
    @Enumerated(EnumType.STRING)
    private WordlistType valid_for;
    public final static String _valid_for = "valid_for";

    @Column(name = "description", length = 100)
    private String description;
    public final static String _description = "description";

    @Column(name = "visibility", length = 100)
    @Enumerated(EnumType.STRING)
    private Visibility visibility;
    public final static String _visibility = "visibility";

    private String creator;
    @Column(name = "creator")
    public static final String _creator = "creator";

    private String location;
    @Column(name = "location")
    public static final String _location = "location";

    @ElementCollection
    private List<String> wordlist = new ArrayList<>();
    public final static String _wordlist = "wordlist";

    @Column(name = "creation_date", nullable = false)
    private Date creation_date;
    public final static String _creation_date = "creation_date";

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

    public WordlistType getValid_for() {
        return valid_for;
    }
    public void setValid_for(WordlistType valid_for) {
        this.valid_for = valid_for;
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
        return creator;
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

    public List<String> getWordlist() {
        return wordlist;
    }
    public void setWordlist(List<String> wordlist) {
        this.wordlist = wordlist;
    }

    public Date getCreation_date() {
        return creation_date;
    }
    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }
}