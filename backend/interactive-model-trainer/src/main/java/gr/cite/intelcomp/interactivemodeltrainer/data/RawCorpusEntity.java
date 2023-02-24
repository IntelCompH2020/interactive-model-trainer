package gr.cite.intelcomp.interactivemodeltrainer.data;

import java.util.Date;
import java.util.List;

public class RawCorpusEntity extends CorpusEntity {

    public static final String _download_date = "download_date";
    private Date download_date;

    public static final String _records = "records";
    private Integer records;

    public static final String _source = "source";
    private String source;

    public static final String _schema = "schema";
    private List<String> schema;

    public Date getDownload_date() {
        return download_date;
    }

    public void setDownload_date(Date download_date) {
        this.download_date = download_date;
    }

    public Integer getRecords() {
        return records;
    }

    public void setRecords(Integer records) {
        this.records = records;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public List<String> getSchema() {
        return schema;
    }

    public void setSchema(List<String> schema) {
        this.schema = schema;
    }
}
