package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.tools.fieldset.FieldSet;

import java.util.List;

public interface SortableByOwner<M, D> {

    List<M> buildSortedByOwnerAsc(FieldSet directives, List<D> data);

    List<M> buildSortedByOwnerDesc(FieldSet directives, List<D> data);

}
