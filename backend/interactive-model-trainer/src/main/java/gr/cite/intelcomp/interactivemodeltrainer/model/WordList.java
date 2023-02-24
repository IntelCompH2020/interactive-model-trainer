package gr.cite.intelcomp.interactivemodeltrainer.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;

import javax.validation.constraints.NotBlank;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class WordList<T> {

    public final static String _id = "id";
    private UUID id;

    public static final String _name = "name";
    @NotBlank
    private String name;

    public static final String _description = "description";
    private String description;

    public static final String _creator = "creator";
    private String creator;

    private String location;
    public static final String _location = "location";

    public static final String _visibility = "visibility";
    private Visibility visibility;

    public static final String _wordlist = "wordlist";
    private List<T> wordlist;

    public final static String _creation_date = "creation_date";
    private Date creation_date;

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

    public Visibility getVisibility() {
        return visibility;
    }
    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    public List<T> getWordlist() {
        return wordlist;
    }
    public void setWordlist(List<T> wordlist) {
        this.wordlist = wordlist;
    }

    public Date getCreation_date() {
        return creation_date;
    }
    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }

}
