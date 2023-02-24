package gr.cite.intelcomp.interactivemodeltrainer.model;

import java.util.ArrayList;

public class LocalDataset {

    private String parquet;
    private String source;
    private String idfld;
    private ArrayList<String> lemmasfld;
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

    public ArrayList<String> getLemmasfld() {
        return lemmasfld;
    }

    public void setLemmasfld(ArrayList<String> lemmasfld) {
        this.lemmasfld = lemmasfld;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }
}
