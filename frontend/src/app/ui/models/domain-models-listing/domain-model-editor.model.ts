import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { DomainModel, DomainModelPersist } from '@app/core/model/model/domain-model.model';
import { DomainModelType, DomainModelSubType } from '@app/core/enum/domain-model-type.enum';
import { Guid } from '@common/types/guid';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';

export class DomainModelEditorModel extends BaseEditorModel implements DomainModelPersist {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
    name: string;
		description: string;
    type: DomainModelType;
		subtype: DomainModelSubType;
		visibility?: ModelVisibility;
    creator: string;
    location: string;
    numberOfHeads?: number;
    depth?: number;
    tag?: string;
    corpus: Guid;
    
	public fromModel(item: DomainModel): DomainModelEditorModel {
		if (item) {
			super.fromModel(item);
            this.name = item.name;
            this.type = item.type;
						this.subtype = item.subtype;
						this.visibility = item.visibility;
            this.creator = item.creator;
            this.location = item.location;
            this.numberOfHeads = item.numberOfHeads;
            this.depth = item.depth;
            this.tag = item.tag;
            this.corpus = item.corpus;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],

			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			subtype: [{ value: this.subtype, disabled: disabled }, context.getValidation('subtype').validators],
			numberOfHeads: [{ value: this.numberOfHeads, disabled: disabled }, context.getValidation('numberOfHeads').validators],
			depth: [{ value: this.depth, disabled: disabled }, context.getValidation('depth').validators],
			tag: [{ value: this.tag, disabled: disabled }, context.getValidation('tag').validators],
			corpus: [{ value: this.corpus, disabled: disabled }, context.getValidation('corpus').validators],

			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required] });
		baseValidationArray.push({ key: 'description', validators: [] });
		baseValidationArray.push({ key: 'visibility', validators: [Validators.required] });
        
		baseValidationArray.push({ key: 'type', validators: [Validators.required] });
		baseValidationArray.push({ key: 'subtype', validators: [Validators.required] });
		baseValidationArray.push({ key: 'numberOfHeads', validators: [] });
		baseValidationArray.push({ key: 'depth', validators: [] });
		baseValidationArray.push({ key: 'tag', validators: [] });
		baseValidationArray.push({ key: 'corpus', validators: [Validators.required] });

		baseValidationArray.push({ key: 'hash', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}