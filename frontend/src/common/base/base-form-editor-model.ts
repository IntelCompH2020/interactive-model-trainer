import { FormBuilder } from '@angular/forms';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';

export abstract class BaseFormEditorModel {

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();
}
