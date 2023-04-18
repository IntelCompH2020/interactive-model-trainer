import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { atLeastItems } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';

export class MergeWordlistsEditorModel extends BaseEditorModel {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
  name: string;
	description: string;
	visibility: WordListVisibility = WordListVisibility.Public;
	lists: string[] = [];

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],
			lists: this.formBuilder.array(this.lists, context.getValidation('lists').validators)
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
		baseValidationArray.push({ key: 'description', validators: [] });
		baseValidationArray.push({ key: 'visibility', validators: [] });
		baseValidationArray.push({ key: 'lists', validators: [atLeastItems(2)] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}