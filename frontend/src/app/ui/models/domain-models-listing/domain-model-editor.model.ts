import { FormBuilder, FormGroup} from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { DomainModel, DomainModelPersist } from '@app/core/model/model/domain-model.model';
import { DomainModelType, DomainModelSubType } from '@app/core/enum/domain-model-type.enum';
import { Guid } from '@common/types/guid';

export class DomainModelEditorModel extends BaseEditorModel implements DomainModelPersist {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
    name: string;
    type: DomainModelType;
    subtype: DomainModelSubType;
    creator: string;
		creation_date: Date;
    location: string;
    private?: boolean;
    numberOfHeads?: number;
    depth?: number;
    tag?: string;
    corpusId: Guid;
    
    
	public fromModel(item: DomainModel): DomainModelEditorModel {
		if (item) {
			super.fromModel(item);
            this.name = item.name;
            this.type = item.type;
            this.subtype = item.subtype;
            this.creator = item.creator;
						this.creation_date = item.creation_date;
            this.location = item.location;
            this.private = !!item.private;
            this.numberOfHeads = item.numberOfHeads;
            this.depth = item.depth;
            this.tag = item.tag;
            this.corpusId = item.corpus?.id;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			location: [{ value: this.location, disabled: disabled }, context.getValidation('location').validators],
			creator: [{ value: this.creator, disabled: disabled }, context.getValidation('creator').validators],
			creation_date: [{value: this.creation_date, disabled: disabled}, context.getValidation('creation_date').validators],
			private: [{ value: this.private, disabled: disabled }, context.getValidation('private').validators],

			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			subtype: [{ value: this.subtype, disabled: disabled }, context.getValidation('subtype').validators],
			numberOfHeads: [{ value: this.numberOfHeads, disabled: disabled }, context.getValidation('numberOfHeads').validators],
			depth: [{ value: this.depth, disabled: disabled }, context.getValidation('depth').validators],
			tag: [{ value: this.tag, disabled: disabled }, context.getValidation('tag').validators],
			corpusId: [{ value: this.corpusId, disabled: disabled }, context.getValidation('corpusId').validators],

			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {


		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'name', validators: [BackendErrorValidator(this.validationErrorModel, 'Name')] });
		baseValidationArray.push({ key: 'creator', validators: [BackendErrorValidator(this.validationErrorModel, 'Creator')] });
		baseValidationArray.push({ key: 'creation_date', validators: [BackendErrorValidator(this.validationErrorModel, 'Creation_date')] });
		baseValidationArray.push({ key: 'location', validators: [BackendErrorValidator(this.validationErrorModel, 'Location')] });
		baseValidationArray.push({ key: 'private', validators: [BackendErrorValidator(this.validationErrorModel, 'Private')] });
        
		baseValidationArray.push({ key: 'type', validators: [BackendErrorValidator(this.validationErrorModel, 'Type')] });
		baseValidationArray.push({ key: 'subtype', validators: [BackendErrorValidator(this.validationErrorModel, 'Subtype')] });
		baseValidationArray.push({ key: 'numberOfHeads', validators: [BackendErrorValidator(this.validationErrorModel, 'NumberOfHeads')] });
		baseValidationArray.push({ key: 'depth', validators: [BackendErrorValidator(this.validationErrorModel, 'Depth')] });
		baseValidationArray.push({ key: 'tag', validators: [BackendErrorValidator(this.validationErrorModel, 'Tag')] });
		baseValidationArray.push({ key: 'corpusId', validators: [BackendErrorValidator(this.validationErrorModel, 'CorpusId')] });


		baseValidationArray.push({ key: 'hash', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}