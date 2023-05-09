import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class DomainModelRetrainEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    name: string;
    epochs: number;

    withName(name: string): DomainModelRetrainEditorModel {
      this.name = name;
      return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
      if (context == null) { context = this.createValidationContext(); }
  
      return this.formBuilder.group({
        name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
        epochs: [{ value: this.epochs, disabled: disabled }, context.getValidation('epochs').validators]
      });
    }

    createValidationContext(): ValidationContext {
      const baseContext: ValidationContext = new ValidationContext();
      const baseValidationArray: Validation[] = new Array<Validation>();

      baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
      baseValidationArray.push({ key: 'epochs', validators: [Validators.required, Validators.min(1)] });

      baseContext.validation = baseValidationArray;
      return baseContext;
    }

}