package gr.cite.intelcomp.interactivemodeltrainer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class LogicalCorpus extends Corpus{

    public static final String _creator = "_creator";
    private UUID creator;

    public static final String _valid_for = "valid_for";
    @NotNull
    private CorpusValidFor valid_for;

    public static final String _dtsets = "dtsets";
    @NotNull
    @NotEmpty
    private List<LocalDataset> Dtsets;

    public static final String _creation_date = "creation_date";
    private Date creation_date;

    public UUID getCreator() {
        return creator;
    }

    public void setCreator(UUID creator) {
        this.creator = creator;
    }

    public CorpusValidFor getValid_for() {
        return valid_for;
    }

    public void setValid_for(CorpusValidFor valid_for) {
        this.valid_for = valid_for;
    }

    @JsonProperty("Dtsets")
    public List<LocalDataset> getDtsets() {
        return Dtsets;
    }

    @JsonProperty("Dtsets")
    public void setDtsets(ArrayList<LocalDataset> dtsets) {
        Dtsets = dtsets;
    }

    public Date getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }
}
