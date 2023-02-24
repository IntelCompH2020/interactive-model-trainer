package gr.cite.intelcomp.interactivemodeltrainer.model;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class LogicalCorpusJson extends CorpusJson {

    public static final String _creator = "creator";
    private UUID creator;

    public static final String _valid_for = "valid_for";
    private CorpusValidFor valid_for;

    public static final String _dtsets = "dtsets";
    private List<LocalDataset> Dtsets;

    public static final String _creation_date = "creation_date";
    private Date creation_date;

    public LogicalCorpusJson(LogicalCorpus corpus) {
        super(corpus);
        this.setCreator(corpus.getCreator());
        this.setValid_for(corpus.getValid_for());
        this.setDtsets(enrichDatasets((ArrayList<LocalDataset>) corpus.getDtsets()));
        this.setCreation_date(corpus.getCreation_date());
    }

    private static ArrayList<LocalDataset> enrichDatasets(ArrayList<LocalDataset> datasets) {
        return (ArrayList<LocalDataset>) datasets.stream().map((dataset) -> {
            LocalDataset d = new LocalDataset();
            d.setParquet("/data/datasets/parquet/"+dataset.getSource());
            d.setSource(dataset.getSource());
            d.setIdfld(dataset.getIdfld());
            d.setLemmasfld(dataset.getLemmasfld());
            d.setFilter(dataset.getFilter());
            return d;
        }).collect(Collectors.toList());
    }

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

    public List<LocalDataset> getDtsets() {
        return Dtsets;
    }

    public void setDtsets(List<LocalDataset> dtsets) {
        Dtsets = dtsets;
    }

    public Date getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(Date creation_date) {
        this.creation_date = creation_date;
    }
}
