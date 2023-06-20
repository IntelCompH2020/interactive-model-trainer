package gr.cite.intelcomp.interactivemodeltrainer.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.WordlistType;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class WordListJson {

    public final static String _id = "id";
    private UUID id;

    public static final String _name = "name";
    private String name;

    public static final String _description = "description";
    private String description;

    public static final String _valid_for = "valid_for";
    private WordlistType valid_for;

    public static final String _visibility = "visibility";
    private Visibility visibility;

    public static final String _creator = "creator";
    private String creator;

    private String location;
    public static final String _location = "location";

    public static final String _wordlist = "wordlist";
    private List<String> wordlist;

    public final static String _creation_date = "creation_date";
    private String creation_date;

    public WordListJson(){}

    public WordListJson(Keyword keyword){
        this.setId(keyword.getId());
        this.setName(keyword.getName());
        this.setDescription(keyword.getDescription());
        this.setVisibility(keyword.getVisibility());
        this.setCreator(keyword.getCreator());
        this.setLocation(keyword.getLocation());
        this.setWordlist(keyword.getWordlist());
        this.setValid_for(WordlistType.keywords);
    }

    public WordListJson(Stopword stopword){
        this.setId(stopword.getId());
        this.setName(stopword.getName());
        this.setDescription(stopword.getDescription());
        this.setVisibility(stopword.getVisibility());
        this.setCreator(stopword.getCreator());
        this.setLocation(stopword.getLocation());
        this.setWordlist(stopword.getWordlist());
        this.setValid_for(WordlistType.stopwords);
    }

    public WordListJson(Equivalence equivalence){
        this.setId(equivalence.getId());
        this.setName(equivalence.getName());
        this.setDescription(equivalence.getDescription());
        this.setVisibility(equivalence.getVisibility());
        this.setCreator(equivalence.getCreator());
        this.setLocation(equivalence.getLocation());
        this.setWordlist(equivalence.getWordlist().stream().map(w -> w.getTerm()+":"+w.getEquivalence()).collect(Collectors.toList()));
        this.setValid_for(WordlistType.equivalences);
    }

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

    public WordlistType getValid_for() {
        return valid_for;
    }
    public void setValid_for(WordlistType valid_for) {
        this.valid_for = valid_for;
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

    public String getCreation_date() {
        return creation_date;
    }
    public void setCreation_date(String creation_date) {
        this.creation_date = creation_date;
    }

}
