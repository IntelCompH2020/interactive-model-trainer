import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class DomainModelActiveLearningEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    nDocs: number;
    sampler: string;
    pRatio: number;
    topProb: number;

  buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
    if (context == null) { context = this.createValidationContext(); }
  
      return this.formBuilder.group({
        nDocs: [{ value: this.nDocs, disabled: disabled }, context.getValidation('nDocs').validators],
        sampler: [{ value: this.sampler, disabled: disabled }, context.getValidation('sampler').validators],
        pRatio: [{ value: this.pRatio, disabled: disabled }, context.getValidation('pRatio').validators],
        topProb: [{ value: this.topProb, disabled: disabled }, context.getValidation('topProb').validators],
      });
  }

  createValidationContext(): ValidationContext {
    const baseContext: ValidationContext = new ValidationContext();
    const baseValidationArray: Validation[] = new Array<Validation>();

    baseValidationArray.push({ key: 'nDocs', validators: [Validators.required] });
    baseValidationArray.push({ key: 'sampler', validators: [Validators.required] });
    baseValidationArray.push({ key: 'pRatio', validators: [Validators.required] });
    baseValidationArray.push({ key: 'topProb', validators: [Validators.required] });

    baseContext.validation = baseValidationArray;
    return baseContext;
  }

}