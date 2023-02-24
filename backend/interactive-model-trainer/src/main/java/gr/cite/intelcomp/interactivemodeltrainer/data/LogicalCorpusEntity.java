package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;
import gr.cite.intelcomp.interactivemodeltrainer.model.LocalDataset;

import java.util.ArrayList;
import java.util.Date;

public class LogicalCorpusEntity extends CorpusEntity {

    public static final String _valid_for = "valid_for";
    private CorpusValidFor valid_for;

    public static final String _dtsets = "dtsets";
    private ArrayList<LocalDataset> Dtsets;

    public static final String _creation_date = "creation_date";
    private Date creation_date;

    @Override
    public CorpusValidFor getValid_for() {
        return valid_for;
    }

    @Override
    public void setValid_for(CorpusValidFor valid_for) {
        this.valid_for = valid_for;
    }

    public ArrayList<LocalDataset> getDtsets() {
        return Dtsets;
    }

    public void setDtsets(ArrayList<LocalDataset> dtsets) {
        Dtsets = dtsets;
    }

    @Override
    public Date getCreation_date() {
        return creation_date;
    }

    @Override
    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }
}
