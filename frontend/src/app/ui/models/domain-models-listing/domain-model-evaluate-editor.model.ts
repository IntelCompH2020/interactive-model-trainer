import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class DomainModelEvaluateEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    name: string;
    trueLabelName: string;

    withName(name: string): DomainModelEvaluateEditorModel {
      this.name = name;
      return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
      if (context == null) { context = this.createValidationContext(); }
  
      return this.formBuilder.group({
        name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
        trueLabelName: [{ value: this.trueLabelName, disabled: disabled }, context.getValidation('trueLabelName').validators]
      });
    }

    createValidationContext(): ValidationContext {
      const baseContext: ValidationContext = new ValidationContext();
      const baseValidationArray: Validation[] = new Array<Validation>();

      baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
      baseValidationArray.push({ key: 'trueLabelName', validators: [Validators.required, Validators.pattern(/[\S]/)] });

      baseContext.validation = baseValidationArray;
      return baseContext;
    }

}