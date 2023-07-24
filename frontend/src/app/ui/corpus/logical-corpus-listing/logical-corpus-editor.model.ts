import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { CorpusItemPersist, LogicalCorpus, LogicalCorpusPersistHelper } from '@app/core/model/corpus/logical-corpus.model';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { Guid } from '@common/types/guid';

export class LogicalCorpusEditorModel implements LogicalCorpusPersistHelper {
    public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
    protected formBuilder: FormBuilder = new FormBuilder();

    constructor() { }

    id: Guid;
    name: string;
    description: string;
    creator: string;
    creation_date: Date;
    visibility: CorpusVisibility;
    validFor: string;
    corpora: CorpusItemPersist[] = [];

    public fromModel(item: LogicalCorpus): LogicalCorpusEditorModel {
        if (item) {

            this.id = item.id;
            this.name = item.name;
            this.description = item.description;
            this.creator = item.creator;
            this.creation_date = item.creation_date;
            this.visibility = item.visibility;
            this.validFor = item.valid_for;
        }
        return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
        if (context == null) { context = this.createValidationContext({ corpora: this.corpora }); }
        // if (context == null) { context = this.createValidationContext({}); }

        return this.formBuilder.group({
            id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
            name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
            description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
            creation_date: [{ value: this.creation_date, disabled: disabled }, context.getValidation('creation_date').validators],
            creator: [{ value: this.creator, disabled: disabled }, context.getValidation('creator').validators],
            visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],
            validFor: [{ value: this.validFor, disabled: disabled }, context.getValidation("validFor").validators],

            corpora: this.formBuilder.array(
                this.corpora.map((corpus, i) => this.formBuilder.group({
                    corpusId: [{ value: corpus.corpusId, disabled: disabled }, context.getValidation(`corpora[${i}].corpusId`).validators], // TODO WHAT IF WE ADD AN EXTRA FIELD
                    corpusName: [{ value: corpus.corpusName, disabled: disabled }, context.getValidation(`corpora[${i}].corpusName`).validators],
                    corpusSource: [{ value: corpus.corpusSource, disabled: disabled }, context.getValidation(`corpora[${i}].corpusSource`).validators],
                    corpusSelections: this.formBuilder.array(
                        (corpus.corpusSelections ?? []).map((corpusSelection, j) => this.formBuilder.group({
                            name: [{ value: corpusSelection.name, disabled: disabled }, context.getValidation(`corpora[${i}].corpusSelections[${j}].name`).validators],
                            type: [{ value: corpusSelection.type, disabled: disabled }, context.getValidation(`corpora[${i}].corpusSelections[${j}].type`).validators],
                            selected: [{ value: corpusSelection.selected, disabled: disabled }, context.getValidation(`corpora[${i}].corpusSelections[${j}].selected`).validators],
                        }))
                    )
                }))
            ),
        });
    }

    createValidationContext(params: { corpora?: CorpusItemPersist[] }): ValidationContext {

        const { corpora } = params;

        const baseContext: ValidationContext = new ValidationContext();
        const baseValidationArray: Validation[] = new Array<Validation>();
        baseValidationArray.push({ key: 'id', validators: [] });
        baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
        baseValidationArray.push({ key: 'description', validators: [] });
        baseValidationArray.push({ key: 'creator', validators: [] });
        baseValidationArray.push({ key: 'location', validators: [] });
        baseValidationArray.push({ key: 'creation_date', validators: [] });
        baseValidationArray.push({ key: 'visibility', validators: [] });
        baseValidationArray.push({ key: 'validFor', validators: [Validators.required] });
        baseValidationArray.push({ key: 'hash', validators: [] });

        corpora?.forEach((corpus, i) => {
            baseValidationArray.push({
                key: `corpora[${i}].corpusId`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusId`)
                ]
            });
            baseValidationArray.push({
                key: `corpora[${i}].corpusName`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusName`)
                ]
            });
            baseValidationArray.push({
                key: `corpora[${i}].corpusSource`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusSource`)
                ]
            });

            corpus.corpusSelections?.forEach((_corpusSelection, j) => {
                baseValidationArray.push({
                    key: `corpora[${i}].corpusSelections[${j}].name`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusSelections[${j}].Name`)
                    ]
                });
                baseValidationArray.push({
                    key: `corpora[${i}].corpusSelections[${j}].type`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusSelections[${j}].Type`)
                    ]
                });
                baseValidationArray.push({
                    key: `corpora[${i}].corpusSelections[${j}].selected`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${i}].CorpusSelections[${j}].Selected`)
                    ]
                });
            })

        });

        baseContext.validation = baseValidationArray;
        return baseContext;
    }



    // TODO RETHINK THIS
    public buildCorpusFormGroup(index: number, corpus: CorpusItemPersist, disabled = false, ctx?: ValidationContext): FormGroup {

        const context = ctx ?? this.createValidationContext({ corpora: [corpus] });

        if (!ctx) {
            const baseValidationArray = context.validation;

            baseValidationArray.push({
                key: `corpora[${index}].corpusId`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusId`)
                ]
            });
            baseValidationArray.push({
                key: `corpora[${index}].corpusName`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusName`)
                ]
            });
            baseValidationArray.push({
                key: `corpora[${index}].corpusSource`,
                validators: [
                    BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusSource`)
                ]
            });

            corpus.corpusSelections?.forEach((corpusSelection, j) => {
                baseValidationArray.push({
                    key: `corpora[${index}].corpusSelections[${j}].name`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusSelections[${j}].Name`)
                    ]
                });
                baseValidationArray.push({
                    key: `corpora[${index}].corpusSelections[${j}].type`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusSelections[${j}].Type`)
                    ]
                });
                baseValidationArray.push({
                    key: `corpora[${index}].corpusSelections[${j}].selected`,
                    validators: [
                        BackendErrorValidator(this.validationErrorModel, `Corpora[${index}].CorpusSelections[${j}].Selected`)
                    ]
                });
            })
        }

        return this.formBuilder.group({
            corpusId: [{ value: corpus.corpusId, disabled: disabled }, context.getValidation(`corpora[${index}].corpusId`).validators], // TODO WHAT IF WE ADD AN EXTRA FIELD
            corpusName: [{ value: corpus.corpusName, disabled: disabled }, context.getValidation(`corpora[${index}].corpusName`).validators],
            corpusSource: [{ value: corpus.corpusSource, disabled: disabled }, context.getValidation(`corpora[${index}].corpusSource`).validators],
            corpusSelections: this.formBuilder.array(
                (corpus.corpusSelections ?? []).map((corpusSelection, j) => this.formBuilder.group({
                    name: [{ value: corpusSelection.name, disabled: disabled }, context.getValidation(`corpora[${index}].corpusSelections[${j}].name`).validators],
                    type: [{ value: corpusSelection.type, disabled: disabled || !corpusSelection.selected }, context.getValidation(`corpora[${index}].corpusSelections[${j}].type`).validators],
                    selected: [{ value: corpusSelection.selected, disabled: disabled }, context.getValidation(`corpora[${index}].corpusSelections[${j}].selected`).validators],
                }))
            )
        })
    }

}

export function getLogicalCorpusUses(): {
    displayName: string,
    value: string
}[] {
    return [
        {
            displayName: "APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.NEW-CORPUS-DIALOG.VALID-FOR-OPTIONS.TM",
            value: "TM"
        },
        {
            displayName: "APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.NEW-CORPUS-DIALOG.VALID-FOR-OPTIONS.DC",
            value: "DC"
        }
    ];
}

export function availableFieldTypes(): any[] {
    return [
        { value: null, label: "Select type", multiSelect: true },
        { value: "id", label: "Id", multiSelect: false },
        { value: "title", label: "Title", multiSelect: false },
        { value: "text", label: "Text", multiSelect: true },
        { value: "lemmas", label: "Lemmas", multiSelect: true },
        { value: "embeddings", label: "Embeddings", multiSelect: false },
        { value: "category", label: "Category", multiSelect: false },
    ];
}