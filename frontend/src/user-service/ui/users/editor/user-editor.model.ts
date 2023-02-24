import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { BaseFormEditorModel } from '@common/base/base-form-editor-model';
import { BackendErrorValidator, E164PhoneValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { Guid } from '@common/types/guid';
import { ContactInfoType } from '@notification-service/core/enum/contact-info-type.enum';
import { UserServiceUser, UserServiceUserContactInfo, UserServiceUserContactInfoPersist, UserServiceUserPersist, UserServiceUserProfile, UserServiceUserProfilePersist } from '@user-service/core/model/user.model';
import { LanguageService } from '@user-service/services/language.service';

export class UserProfileEditorModel extends BaseFormEditorModel implements UserServiceUserProfilePersist {
	id?: Guid;
	timezone: string;
	culture: string;
	language: string;
	profilePicture: string;
	hash: string;

	public fromModel(item: UserServiceUserProfile): UserProfileEditorModel {
		this.id = item.id;
		this.timezone = item.timezone;
		this.culture = item.culture;
		this.language = item.language;
		this.profilePicture = item.profilePictureRef;
		return this;
	}

	buildForm(installationConfiguration: InstallationConfigurationService, languageService: LanguageService, context: ValidationContext, disabled: boolean = false): FormGroup {
		return this.formBuilder.group({
			timezone: [{ value: this.timezone || installationConfiguration.defaultTimezone, disabled: disabled }, context.getValidation('timezone').validators],
			culture: [{ value: this.culture || installationConfiguration.defaultCulture, disabled: disabled }, context.getValidation('culture').validators],
			language: [{ value: this.language || languageService.getLanguageValue(installationConfiguration.defaultLanguage), disabled: disabled }, context.getValidation('language').validators],
		});
	}
}
export class UserContactInfoEditorModel extends BaseFormEditorModel implements UserServiceUserContactInfoPersist {
	type: ContactInfoType;
	value: string;

	constructor(type?: ContactInfoType) {
		super();
		this.type = type;
	}

	public fromModel(item: UserServiceUserContactInfo): UserContactInfoEditorModel {
		this.type = item.type;
		this.value = item.value;
		return this;
	}

	buildForm(context: ValidationContext, disabled: boolean = false): FormGroup {
		return this.formBuilder.group({
			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			value: [{ value: this.value, disabled: disabled }, this.getValidatorsForType(this.type, context)],
		});
	}

	getValidatorsForType(contactInfoType: ContactInfoType, context: ValidationContext): ValidatorFn[] {
		switch (contactInfoType) {
			case ContactInfoType.Email:
				return context.getValidation('emailValue').validators;
			case ContactInfoType.MobilePhone:
				return context.getValidation('mobilePhoneValue').validators;
			case ContactInfoType.LandLinePhone:
				return context.getValidation('landlinePhoneValue').validators;
			default:
				return context.getValidation('value').validators;
		}
	}

	createValidationContextSubItem(baseProperty: string, validationEM: ValidationErrorModel): ValidationContext {
		this.validationErrorModel = validationEM;
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'type', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Type`)] });
		baseValidationArray.push({ key: 'value', validators: [BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'emailValue', validators: [BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'mobilePhoneValue', validators: [E164PhoneValidator(), BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseValidationArray.push({ key: 'landlinePhoneValue', validators: [E164PhoneValidator(), BackendErrorValidator(this.validationErrorModel, `${baseProperty}.Value`)] });
		baseContext.validation = baseValidationArray;

		return baseContext;
	}
}

export class UserEditorModel extends BaseEditorModel implements UserServiceUserPersist {
	name: string;
	profile: UserProfileEditorModel;
	contacts: UserContactInfoEditorModel[];

	public fromModel(item: UserServiceUser): UserEditorModel {
		if (item) {
			super.fromModel(item);
			this.name = item.name;
			if (item.profile) { this.profile = new UserProfileEditorModel().fromModel(item.profile); }

			if (item.contacts) { this.contacts = item.contacts.map(x => new UserContactInfoEditorModel().fromModel(x)); }
			if (!this.contacts) { this.contacts = []; }
			if (this.contacts.filter(x => x.type === ContactInfoType.Email)[0] === undefined) { this.contacts.unshift(new UserContactInfoEditorModel(ContactInfoType.Email)); }
			if (this.contacts.filter(x => x.type === ContactInfoType.MobilePhone)[0] === undefined) { this.contacts.splice(1, 0, new UserContactInfoEditorModel(ContactInfoType.MobilePhone)); }
			if (this.contacts.filter(x => x.type === ContactInfoType.LandLinePhone)[0] === undefined) { this.contacts.push(new UserContactInfoEditorModel(ContactInfoType.LandLinePhone)); }
		}

		return this;
	}

	buildForm(installationConfiguration: InstallationConfigurationService, languageService: LanguageService, context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		const contactsFormArray = new Array<FormGroup>();
		if (this.contacts) {
			for (let i = 0; i < this.contacts.length; i++) {
				const contact = this.contacts[i];
				contactsFormArray.push(contact.buildForm(context.getValidation('contacts[' + i + ']').descendantValidations, disabled));
			}
		}

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
			contacts: this.formBuilder.array(contactsFormArray),
			profile: this.profile ? this.profile.buildForm(installationConfiguration, languageService, context.getValidation('profile').descendantValidations, disabled) : new UserProfileEditorModel().buildForm(installationConfiguration, languageService, context.getValidation('profile').descendantValidations, disabled),
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Name')] });
		baseValidationArray.push({ key: 'email', validators: [Validators.email, BackendErrorValidator(this.validationErrorModel, 'Contacts[0].Email')] });
		baseValidationArray.push({ key: 'mobilePhone', validators: [BackendErrorValidator(this.validationErrorModel, 'Contacts[1].MobilePhone')] });
		baseValidationArray.push({ key: 'landlinePhone', validators: [BackendErrorValidator(this.validationErrorModel, 'Contacts[2].LandLinePhone')] });
		baseValidationArray.push({ key: 'isValidated', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'IsValidated')] });
		baseValidationArray.push({ key: 'type', validators: [BackendErrorValidator(this.validationErrorModel, 'Type')] });
		baseValidationArray.push({ key: 'hash', validators: [BackendErrorValidator(this.validationErrorModel, 'Hash')] });

		baseValidationArray.push({ key: 'roles', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Roles')] });

		const profileContext: ValidationContext = new ValidationContext();
		const profileArray: Validation[] = new Array<Validation>();
		profileArray.push({ key: 'timezone', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Timezone')] });
		profileArray.push({ key: 'culture', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Culture')] });
		profileArray.push({ key: 'language', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Profile.Language')] });
		profileContext.validation = profileArray;

		baseValidationArray.push({ key: 'profile', descendantValidations: profileContext });

		if (this.contacts) {
			for (let i = 0; i < this.contacts.length; i++) {
				const contact = this.contacts[i];
				const contactContext = contact.createValidationContextSubItem(`Contacts[${i}]`, this.validationErrorModel);
				baseValidationArray.push({ key: `contacts[${i}]`, descendantValidations: contactContext });
			}
		}

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}

