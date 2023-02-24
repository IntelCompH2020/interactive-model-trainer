import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { Tenant, TenantPersist } from '@app/core/model/tenant/tenant.model';

export class TenantEditorModel extends BaseEditorModel implements TenantPersist {
	code: string;
	name: string;
	config: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }

	public fromModel(item: Tenant): TenantEditorModel {
		if (item) {
			super.fromModel(item);
			this.code = item.code;
			this.name = item.name;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			code: [{ value: this.code, disabled: disabled }, context.getValidation('code').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators]
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'code', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Code')] });
		baseValidationArray.push({ key: 'name', validators: [BackendErrorValidator(this.validationErrorModel, 'Name')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
