package gr.cite.intelcomp.interactivemodeltrainer.model.builder;

import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.tools.fieldset.FieldSet;

import java.util.List;

public interface SortableByOwner<M, D> {

    List<M> buildSortedByOwnerAsc(FieldSet directives, List<D> data);

    default List<M> buildSortedByOwnerAsc(FieldSet directives, List<D> data, List<UserEntity> users) {
        return buildSortedByOwnerAsc(directives, data);
    };

    List<M> buildSortedByOwnerDesc(FieldSet directives, List<D> data);

    default List<M> buildSortedByOwnerDesc(FieldSet directives, List<D> data, List<UserEntity> users) {
        return buildSortedByOwnerDesc(directives, data);
    };

}
