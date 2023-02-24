package gr.cite.intelcomp.interactivemodeltrainer.model;

public final class Equivalence extends WordList<Equivalence.EquivalenceWord> {

    public static class EquivalenceWord {
        public EquivalenceWord(String term, String equivalence) {
            this.term = term;
            this.equivalence = equivalence;
        }

        public String term;
        public String equivalence;

        public String getTerm() {
            return term;
        }
        public void setTerm(String term) {
            this.term = term;
        }

        public String getEquivalence() {
            return equivalence;
        }
        public void setEquivalence(String equivalence) {
            this.equivalence = equivalence;
        }
    }

}
