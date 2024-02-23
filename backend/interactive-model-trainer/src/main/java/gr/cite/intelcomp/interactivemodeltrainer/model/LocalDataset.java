package gr.cite.intelcomp.interactivemodeltrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LocalDataset {

    private String parquet;
    private String source;
    private String idfld;
    private String titlefld;
    private String textfld;
    private ArrayList<String> lemmasfld;
    private String embeddingsfld;
    private String categoryfld;

    private String filter;

    public String getParquet() {
        return parquet;
    }

    public void setParquet(String parquet) {
        this.parquet = parquet;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getIdfld() {
        return idfld;
    }

    public void setIdfld(String idfld) {
        this.idfld = idfld;
    }

    public String getTitlefld() {
        return titlefld;
    }

    public void setTitlefld(String titlefld) {
        this.titlefld = titlefld;
    }

    public String getTextfld() {
        return textfld;
    }

    public void setTextfld(String textfld) {
        this.textfld = textfld;
    }

    public ArrayList<String> getLemmasfld() {
        return lemmasfld;
    }

    public void setLemmasfld(ArrayList<String> lemmasfld) {
        this.lemmasfld = lemmasfld;
    }

    public String getEmbeddingsfld() {
        return embeddingsfld;
    }

    public void setEmbeddingsfld(String embeddingsfld) {
        this.embeddingsfld = embeddingsfld;
    }

    public String getCategoryfld() {
        return categoryfld;
    }

    public void setCategoryfld(String categoryfld) {
        this.categoryfld = categoryfld;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }
}
