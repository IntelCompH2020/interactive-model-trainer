import { FormGroup, Validators } from "@angular/forms";
import { ModelVisibility } from "@app/core/enum/model-visibility.enum";
import { DomainModel } from "@app/core/model/model/domain-model.model";
import { TopicModel } from "@app/core/model/model/topic-model.model";
import { BaseEditorModel } from "@common/base/base-editor.model";
import { Validation, ValidationContext } from "@common/forms/validation/validation-context";

export class ModelPatchEditorModel extends BaseEditorModel {

  constructor() {
    super();
  }
  name: string;
  description: string;
  visibility: ModelVisibility;

  public fromModel(item: TopicModel | DomainModel): ModelPatchEditorModel {
		if (item) {
			super.fromModel(item);
      this.name = item.name;
			this.description = item.description;
      this.visibility = item.visibility;
		}
		return this;
	}

  buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
    if (context == null) { context = this.createValidationContext(); }

    return this.formBuilder.group({
      name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
      description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
      visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators]
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