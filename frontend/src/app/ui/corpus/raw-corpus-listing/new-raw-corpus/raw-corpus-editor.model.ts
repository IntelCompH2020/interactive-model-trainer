import { FormBuilder, FormGroup } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { RawCorpus, RawCorpusField, RawCorpusFieldPersist, RawCorpusPersist } from '@app/core/model/corpus/raw-corpus.model';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { Guid } from '@common/types/guid';

export class RawCorpusEditorModel implements RawCorpusPersist {
    public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { }

    id: Guid;
    name: string;
    description: string;
    visibility: CorpusVisibility;
    download_date: Date;
    records: number;
    source: string;
    schema: RawCorpusFieldPersist[] | string[];

    public fromModel(item: RawCorpus): RawCorpusEditorModel {
        if (item) {

            this.name = item.name;
            this.description = item.description;
            this.visibility = item.visibility;
            this.download_date = item.download_date;
            this.records = item.records;
            this.source = item.source;
            this.schema = (item.schema ?? [])?.map(x => ({ name: x, selected: false, type: "string" }));
        }
        return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
        if (context == null) { context = this.createValidationContext({ schema: this.schema }); }

        return this.formBuilder.group({
            id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
            name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
            visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],

            schema: this.formBuilder.array(
                this.schema.map((field, i) => this.formBuilder.group({
                    name: [{ value: field.name, disabled: disabled }, context.getValidation(`fields[${i}].name`).validators],
                    type: [{ value: field.type, disabled: disabled }, context.getValidation(`fields[${i}].type`).validators],
                    selected: [{ value: field.selected, disabled: disabled }, context.getValidation(`fields[${i}].selected`).validators],
                }))
            ),
        });
    }

    createValidationContext(params: { schema?: RawCorpusFieldPersist[] | string[] }): ValidationContext {

        const { schema } = params;

        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
        baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
        baseValidationArray.push({ key: 'name', validators: [BackendErrorValidator(this.validationErrorModel, 'Name')] });
        baseValidationArray.push({ key: 'creator', validators: [BackendErrorValidator(this.validationErrorModel, 'Creator')] });
        baseValidationArray.push({ key: 'location', validators: [BackendErrorValidator(this.validationErrorModel, 'Location')] });
        baseValidationArray.push({ key: 'visibility', validators: [BackendErrorValidator(this.validationErrorModel, 'Visibility')] });
        baseValidationArray.push({ key: 'hash', validators: [] });

        schema?.forEach((field, i) => {
            baseValidationArray.push({
                key: `schema[${i}].name`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Schema[${i}].Name`)
                ]
            });
            baseValidationArray.push({
                key: `schema[${i}].type`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Schema[${i}].Type`)
                ]
            });
            baseValidationArray.push({
                key: `schema[${i}].selected`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Schema[${i}].Selected`)
                ]
            });
        });

        baseContext.validation = baseValidationArray;
        return baseContext;
    }
}