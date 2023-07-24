package gr.cite.intelcomp.interactivemodeltrainer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusValidFor;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class LogicalCorpusJson extends CorpusJson {

    public final static String _id = "id";
    private UUID id;

    public static final String _creator = "creator";
    private String creator;

    public static final String _valid_for = "valid_for";
    private CorpusValidFor valid_for;

    public static final String _dtsets = "dtsets";
    private List<LocalDataset> Dtsets;

    public static final String _creation_date = "creation_date";
    private String creation_date;

    public LogicalCorpusJson(LogicalCorpus corpus, String parquetFolder) {
        super(corpus);

        this.setCreator(corpus.getCreator());
        this.setValid_for(corpus.getValid_for());
        this.setDtsets(enrichDatasets((ArrayList<LocalDataset>) corpus.getDtsets(), parquetFolder));
//        this.setCreation_date(corpus.getCreation_date());
    }

    private static ArrayList<LocalDataset> enrichDatasets(ArrayList<LocalDataset> datasets, String parquetFolder) {
        return (ArrayList<LocalDataset>) datasets.stream().map((dataset) -> {
            LocalDataset d = new LocalDataset();
            d.setParquet(parquetFolder + "/" + dataset.getSource());
            d.setSource(dataset.getSource());
            d.setIdfld(dataset.getIdfld());
            d.setTitlefld(dataset.getTitlefld());
            d.setTextfld(dataset.getTextfld());
            d.setLemmasfld(dataset.getLemmasfld());
            d.setEmbeddingsfld(dataset.getEmbeddingsfld());
            d.setCategoryfld(dataset.getCategoryfld());
            d.setFilter(dataset.getFilter());
            return d;
        }).collect(Collectors.toList());
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
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
    public void setDtsets(List<LocalDataset> dtsets) {
        Dtsets = dtsets;
    }

    public String getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(String creation_date) {
        this.creation_date = creation_date;
    }
}
