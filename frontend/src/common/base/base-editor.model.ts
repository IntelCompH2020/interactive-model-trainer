import { FormBuilder, Form } from '@angular/forms';
import { ValidationErrorModel } from '../forms/validation/error-model/validation-error-model';
import { Guid } from '../types/guid';
import { BaseEntity } from '@common/base/base-entity.model';
import { IsActive } from '@idp-service/core/enum/is-active.enum';

export abstract class BaseEditorModel {
	id: Guid;
	isActive: IsActive;
	hash: string;
	createdAt: Date;
	updatedAt: Date;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	public fromModel(item: BaseEntity): BaseEditorModel {
		if (item) {
			this.id = item.id;
			this.isActive = item.isActive;
			this.hash = item.hash;
			if (item.createdAt) { this.createdAt = item.createdAt; }
			if (item.updatedAt) { this.updatedAt = item.updatedAt; }
		}
		return this;
	}
}
