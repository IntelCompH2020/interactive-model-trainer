import { FormGroup, Validators } from "@angular/forms";
import { CorpusVisibility } from "@app/core/enum/corpus-visibility.enum";
import { RawCorpus } from "@app/core/model/corpus/raw-corpus.model";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class RawCorpusPatchEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
  name: string;
  description: string;
  visibility: CorpusVisibility;

  public fromModel(item: RawCorpus): RawCorpusPatchEditorModel {
		if (item) {
      this.name = item.name;
			this.description = item.description;
      this.visibility = CorpusVisibility.Public
		}
		return this;
	}

  buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
    if (context == null) { context = this.createValidationContext(); }

    return this.formBuilder.group({
      name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
      description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
      visibility: [{ value: this.visibility || CorpusVisibility.Public, disabled: disabled }, context.getValidation('visibility').validators]
    });
  }

  createValidationContext(): ValidationContext {
    const baseContext: ValidationContext = new ValidationContext();
    const baseValidationArray: Validation[] = new Array<Validation>();

    baseValidationArray.push({ key: 'name', validators: [Validators.required] });
    baseValidationArray.push({ key: 'description', validators: [] });
    baseValidationArray.push({ key: 'visibility', validators: [Validators.required] });

    baseContext.validation = baseValidationArray;
    return baseContext;
  }

}