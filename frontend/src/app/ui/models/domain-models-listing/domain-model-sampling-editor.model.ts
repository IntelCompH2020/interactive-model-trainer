import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class DomainModelSamplingEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    name: string;
    numOfDocuments: number;
    sampler: string;

    withName(name: string): DomainModelSamplingEditorModel {
      this.name = name;
      return this;
    }

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
      if (context == null) { context = this.createValidationContext(); }
  
      return this.formBuilder.group({
        name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
        numOfDocuments: [{ value: this.numOfDocuments, disabled: disabled }, context.getValidation('numOfDocuments').validators],
        sampler: [{ value: this.sampler, disabled: disabled }, context.getValidation('sampler').validators]
      });
    }

    createValidationContext(): ValidationContext {
      const baseContext: ValidationContext = new ValidationContext();
      const baseValidationArray: Validation[] = new Array<Validation>();

      baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
      baseValidationArray.push({ key: 'numOfDocuments', validators: [Validators.required, Validators.min(1)] });
      baseValidationArray.push({ key: 'sampler', validators: [Validators.required] });

      baseContext.validation = baseValidationArray;
      return baseContext;
    }

}