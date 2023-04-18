import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class DomainModelClassifierEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    modelType: string;
    modelName: string;
    maximumImbalance: number;
    nmax: number;
    freezeEncoder: boolean;
    epochs: number;
    batchSize: number;

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
      if (context == null) { context = this.createValidationContext(); }
  
      return this.formBuilder.group({
        modelType: [{ value: this.modelType, disabled: disabled }, context.getValidation('modelType').validators],
        modelName: [{ value: this.modelName, disabled: disabled }, context.getValidation('modelName').validators],
        maximumImbalance: [{ value: this.maximumImbalance, disabled: disabled }, context.getValidation('maximumImbalance').validators],
        nmax: [{ value: this.nmax, disabled: disabled }, context.getValidation('nmax').validators],
        freezeEncoder: [{ value: this.freezeEncoder, disabled: disabled }, context.getValidation('freezeEncoder').validators],
        epochs: [{ value: this.epochs, disabled: disabled }, context.getValidation('epochs').validators],
        batchSize: [{ value: this.batchSize, disabled: disabled }, context.getValidation('batchSize').validators],
      });
    }

    createValidationContext(): ValidationContext {
      const baseContext: ValidationContext = new ValidationContext();
      const baseValidationArray: Validation[] = new Array<Validation>();

      baseValidationArray.push({ key: 'modelType', validators: [Validators.required] });
      baseValidationArray.push({ key: 'modelName', validators: [Validators.required] });
      baseValidationArray.push({ key: 'maximumImbalance', validators: [Validators.required] });
      baseValidationArray.push({ key: 'nmax', validators: [Validators.required] });
      baseValidationArray.push({ key: 'freezeEncoder', validators: [Validators.required] });
      baseValidationArray.push({ key: 'epochs', validators: [Validators.required] });
      baseValidationArray.push({ key: 'batchSize', validators: [Validators.required] });

      baseContext.validation = baseValidationArray;
      return baseContext;
    }

}