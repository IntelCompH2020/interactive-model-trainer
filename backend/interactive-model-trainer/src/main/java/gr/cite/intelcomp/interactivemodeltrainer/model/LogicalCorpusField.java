package gr.cite.intelcomp.interactivemodeltrainer.model;

import java.util.List;

public class LogicalCorpusField {

    public static class MergedCorpusField {

        private String name, type, corpusName;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getCorpusName() {
            return corpusName;
        }

        public void setCorpusName(String corpusName) {
            this.corpusName = corpusName;
        }
    }

    private String name, type;

    private List<MergedCorpusField> originalFields;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<MergedCorpusField> getOriginalFields() {
        return originalFields;
    }

    public void setOriginalFields(List<MergedCorpusField> originalFields) {
        this.originalFields = originalFields;
    }
}
