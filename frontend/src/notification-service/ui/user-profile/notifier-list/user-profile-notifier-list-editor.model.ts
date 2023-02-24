import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { UserNotificationPreferencePersist } from '@notification-service/core/model/user-notification-preference.model';

export class UserProfileNotifierListEditorModel implements UserNotificationPreferencePersist {
	userId?: Guid;
	notificationPreferences: { [key: string]: ContactType[] };

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(userId: Guid, notificationPreferences: { [key: string]: ContactType[] }): UserProfileNotifierListEditorModel {
		this.userId = userId;
		this.notificationPreferences = notificationPreferences;
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false, availableNotificationTypes: NotificationType[]): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const notificationPreferencesFormGroup = this.formBuilder.group({});
		availableNotificationTypes.forEach(type => {
			notificationPreferencesFormGroup.addControl(type, new FormControl(this.notificationPreferences ? this.notificationPreferences[type] : undefined));
		});

		return this.formBuilder.group({
			userId: [{ value: this.userId, disabled: disabled }, context.getValidation('userId').validators],
			notificationPreferences: notificationPreferencesFormGroup,
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();

		baseValidationArray.push({ key: 'userId', validators: [BackendErrorValidator(this.validationErrorModel, 'UserId')] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}
