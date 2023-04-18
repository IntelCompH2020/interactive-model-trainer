import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { DomainModel, DomainModelPersist } from '@app/core/model/model/domain-model.model';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';

export class DomainModelEditorModel extends BaseEditorModel implements DomainModelPersist {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
    name: string;
		description: string;
		visibility?: ModelVisibility;
    tag?: string;
    TrDtSet: string;

		method: string;
		weightingFactor?: number;
		numberOfElements?: number;
		minimumScore?: number;
		modelName?: string;
    
	public fromModel(item: DomainModel): DomainModelEditorModel {
		if (item) {
			super.fromModel(item);
            this.name = item.name;
						this.description = item.description;
						this.visibility = item.visibility;
            this.tag = item.tag;
            this.TrDtSet = item.TrDtSet;
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
			tag: [{ value: this.tag, disabled: disabled }, context.getValidation('tag').validators],
			corpus: [{ value: this.TrDtSet, disabled: disabled }, context.getValidation('corpus').validators],

			method: [{ value: this.method, disabled: disabled }, context.getValidation('method').validators],
			weightingFactor: [{ value: this.weightingFactor, disabled: disabled }, context.getValidation('minimumScore').validators],
			numberOfElements: [{ value: this.numberOfElements, disabled: disabled }, context.getValidation('numberOfElements').validators],
			minimumScore: [{ value: this.minimumScore, disabled: disabled }, context.getValidation('minimumScore').validators],
			modelName: [{ value: this.modelName, disabled: disabled }, context.getValidation('modelName').validators],

			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required] });
		baseValidationArray.push({ key: 'description', validators: [] });
		baseValidationArray.push({ key: 'visibility', validators: [] });
		baseValidationArray.push({ key: 'tag', validators: [] });
		baseValidationArray.push({ key: 'corpus', validators: [Validators.required] });

		baseValidationArray.push({ key: 'method', validators: [] });
		baseValidationArray.push({ key: 'weightingFactor', validators: [] });
		baseValidationArray.push({ key: 'numberOfElements', validators: [] });
		baseValidationArray.push({ key: 'minimumScore', validators: [] });
		baseValidationArray.push({ key: 'modelName', validators: [] });

		baseValidationArray.push({ key: 'hash', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}