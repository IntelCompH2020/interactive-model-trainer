import { FormGroup, Validators } from "@angular/forms";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";
import { determinePreprocessingValidation } from "../topic-model-params.model";

export class TopicModelPreprocessingEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
    minLemmas: number;
    noBelow: number;
    noAbove: number;
    keepN: number;
    stopwords: string[];
    equivalences: string[];

    buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
      if (context == null) { context = this.createValidationContext(); }
    
      return this.formBuilder.group({
        minLemmas: [{ value: this.minLemmas, disabled: disabled }, context.getValidation('minLemmas').validators],
        noBelow: [{ value: this.noBelow, disabled: disabled }, context.getValidation('noBelow').validators],
        noAbove: [{ value: this.noAbove, disabled: disabled }, context.getValidation('noAbove').validators],
        keepN: [{ value: this.keepN, disabled: disabled }, context.getValidation('keepN').validators],
        stopwords: [{ value: this.stopwords, disabled: disabled }, context.getValidation('stopwords').validators],
        equivalences: [{ value: this.equivalences, disabled: disabled }, context.getValidation('equivalences').validators]
      });
    }

    createValidationContext(): ValidationContext {
      const baseContext: ValidationContext = new ValidationContext();
      const baseValidationArray: Validation[] = new Array<Validation>();

      baseValidationArray.push({ key: 'minLemmas', validators: [...determinePreprocessingValidation('minLemmas')] });
      baseValidationArray.push({ key: 'noBelow', validators: [...determinePreprocessingValidation('noBelow')] });
      baseValidationArray.push({ key: 'noAbove', validators: [...determinePreprocessingValidation('noAbove')] });
      baseValidationArray.push({ key: 'keepN', validators: [...determinePreprocessingValidation('keepN')] });
      baseValidationArray.push({ key: 'stopwords', validators: [] });
      baseValidationArray.push({ key: 'equivalences', validators: [] });

      baseContext.validation = baseValidationArray;
      return baseContext;
    }

}