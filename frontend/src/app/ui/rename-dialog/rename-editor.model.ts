import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class RenameEditorModel {

	protected formBuilder: FormBuilder = new FormBuilder();

  constructor() {}
  oldName: string;
  newName: string;

  public fromModel(name: string): RenameEditorModel {
		if (name) {
      this.oldName = name;
      this.newName = "";
		}
		return this;
	}

  buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
    if (context == null) { context = this.createValidationContext(); }

    return this.formBuilder.group({
      oldName: [{ value: this.oldName.trim(), disabled: disabled }, context.getValidation('oldName').validators],
      newName: [{ value: this.newName.trim(), disabled: disabled }, context.getValidation('newName').validators]
    });
  }

  createValidationContext(): ValidationContext {
    const baseContext: ValidationContext = new ValidationContext();
    const baseValidationArray: Validation[] = new Array<Validation>();

    baseValidationArray.push({ key: 'oldName', validators: [Validators.required] });
    baseValidationArray.push({ key: 'newName', validators: [Validators.required, Validators.pattern(/[\S]/)] });

    baseContext.validation = baseValidationArray;
    return baseContext;
  }

}

export interface RenamePersist {
	oldName: string;
	newName: string;
}