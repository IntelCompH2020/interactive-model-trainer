import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { Guid } from '@common/types/guid';
import { NotificationTemplateChannel } from '@notification-service/core/enum/notification-template-channel.enum';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationFieldInfo, NotificationFieldOptions, NotificationTemplate, NotificationTemplatePersist, NotificationTemplateValue } from '@notification-service/core/model/notification-template.model';

export class NotificationTemplateEditorModel implements NotificationTemplatePersist {
	id: Guid;
	channel: NotificationTemplateChannel;
	notificationType: NotificationType;
	kind: NotificationTemplateKind;
	language: string;
	description: string;
	value: NotificationTemplateValueEditorModel;
	hash: string;

	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: NotificationTemplate): NotificationTemplateEditorModel {
		this.id = item.id;
		this.channel = item.channel;
		this.notificationType = item.notificationType;
		this.kind = item.kind;
		this.language = item.language;
		this.description = item.description;
		if (item.value) { this.value = new NotificationTemplateValueEditorModel().fromModel(item.value); }
		this.hash = item.hash;

		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			channel: [{ value: this.channel, disabled: disabled }, context.getValidation('channel').validators],
			notificationType: [{ value: this.notificationType, disabled: disabled }, context.getValidation('notificationType').validators],
			kind: [{ value: this.kind, disabled: disabled }, context.getValidation('kind').validators],
			language: [{ value: this.language, disabled: disabled }, context.getValidation('language').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			value: this.value ? this.value.buildForm(null, 'Value', disabled, this.validationErrorModel) : new NotificationTemplateValueEditorModel().buildForm(null, 'Value', disabled, this.validationErrorModel),
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [BackendErrorValidator(this.validationErrorModel, 'Id')] });
		baseValidationArray.push({ key: 'channel', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Channel')] });
		baseValidationArray.push({ key: 'notificationType', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'NotificationType')] });
		baseValidationArray.push({ key: 'kind', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Kind')] });
		baseValidationArray.push({ key: 'language', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Language')] });
		baseValidationArray.push({ key: 'description', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Description')] });
		baseValidationArray.push({ key: 'value', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, 'Value')] });
		baseValidationArray.push({ key: 'hash', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}

export class NotificationTemplateValueEditorModel implements NotificationTemplateValue {
	subjectText: string;
	subjectFieldOptions: NotificationFieldOptionsEditorModel;
	bodyText: string;
	bodyFieldOptions: NotificationFieldOptionsEditorModel;

	public validationErrorModel;
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: NotificationTemplateValue): NotificationTemplateValueEditorModel {
		if (item) {
			this.subjectText = item.subjectText;
			if (item.subjectFieldOptions) { this.subjectFieldOptions = new NotificationFieldOptionsEditorModel().fromModel(item.subjectFieldOptions); }
			this.bodyText = item.bodyText;
			if (item.bodyFieldOptions) { this.bodyFieldOptions = new NotificationFieldOptionsEditorModel().fromModel(item.bodyFieldOptions); }
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }
		return this.formBuilder.group({
			subjectText: [{ value: this.subjectText, disabled: disabled }, context.getValidation('subjectText').validators],
			subjectFieldOptions: this.subjectFieldOptions ? this.subjectFieldOptions.buildForm(null, 'SubjectFieldOptions', disabled, this.validationErrorModel) : new NotificationFieldOptionsEditorModel().buildForm(null, 'SubjectFieldOptions', disabled, this.validationErrorModel),
			bodyText: [{ value: this.bodyText, disabled: disabled }, context.getValidation('bodyText').validators],
			bodyFieldOptions: this.bodyFieldOptions ? this.bodyFieldOptions.buildForm(null, 'BodyFieldOptions', disabled, this.validationErrorModel) : new NotificationFieldOptionsEditorModel().buildForm(null, 'BodyFieldOptions', disabled, this.validationErrorModel),
		});
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'subjectText', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'SubjectText'))] });
		baseValidationArray.push({ key: 'bodyText', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'BodyText'))] });
		baseContext.validation = baseValidationArray;
		return baseContext;
	}

	helperGetValidation(baseProperty: string, property: string) {
		if (baseProperty) {
			return `${baseProperty}.${property}`;
		} else {
			return property;
		}
	}
}

export class NotificationFieldOptionsEditorModel implements NotificationFieldOptions {
	mandatory?: string[];
	options?: NotificationFieldInfoEditorModel[];
	formatting?: { [key: string]: string };

	public validationErrorModel;
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: NotificationFieldOptions): NotificationFieldOptionsEditorModel {
		if (item) {
			this.mandatory = item.mandatory;
			if (item.options) { this.options = item.options.map(x => new NotificationFieldInfoEditorModel().fromModel(x)); }
			this.formatting = item.formatting;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }

		const mandatoryFormArray = new Array<FormControl>();
		if (this.mandatory) {
			this.mandatory.forEach((element, index) => {
				mandatoryFormArray.push(new FormControl({ value: element, disabled: disabled }, [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Mandatory[' + index + ']'))]));
			});
		}

		const optionsFormArray = new Array<FormGroup>();
		if (this.options) {
			this.options.forEach((element, index) => {
				optionsFormArray.push(element.buildForm(context, this.helperGetValidation(baseProperty, 'Options'), disabled, null));
			});
		}

		const group = this.formBuilder.group({
			mandatory: this.formBuilder.array(mandatoryFormArray),
			formatting: [{ value: this.formatting, disabled: disabled }, context.getValidation('formatting').validators],
			options: this.formBuilder.array(optionsFormArray),
		});
		if (disabled) { group.disable(); }
		return group;
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'mandatory', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Mandatory'))] });
		baseValidationArray.push({ key: 'options', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Options'))] });
		baseValidationArray.push({ key: 'formatting', validators: [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Formatting'))] });
		baseContext.validation = baseValidationArray;
		return baseContext;
	}

	helperGetValidation(baseProperty: string, property: string) {
		if (baseProperty) {
			return `${baseProperty}.${property}`;
		} else {
			return property;
		}
	}

	buildMandatoryItemForm(value: string, index: number, disabled: boolean = false, baseProperty: string): FormControl {
		return new FormControl({ value: value, disabled: disabled }, [BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, `Mandatory[${index}]`))]);
	}

	helperReapplyMandatoryItemsValidators(details: FormArray) {
		if (!Array.isArray(details.controls)) { return; }
		details.controls.forEach((element, index) => {
			element.setValidators([BackendErrorValidator(this.validationErrorModel, `Mandatory[${index}]`)]);
		});
	}

	buildOptionalItemForm(item: NotificationFieldInfoEditorModel, index: number, disabled: boolean = false): FormGroup {
		return item.buildForm(null, `Options[${index}]`, disabled, this.validationErrorModel);
	}

	helperReapplyOptionalItemsValidators(array: FormArray) {
		if (!Array.isArray(array.controls)) { return; }
		array.controls.forEach((element, index) => {
			const editorModel = new NotificationFieldInfoEditorModel();
			editorModel.validationErrorModel = this.validationErrorModel;
			const context = editorModel.createValidationContext(`Options[${index}]`);
			const formGroup = element as FormGroup;
			Object.keys(formGroup.controls).forEach(key => {
				formGroup.get(key).setValidators(context.getValidation(key).validators);
			});
		});
	}
}

export class NotificationFieldInfoEditorModel implements NotificationFieldInfo {
	key: string;
	value: string;

	public validationErrorModel;
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { }

	public fromModel(item: NotificationFieldInfo): NotificationFieldInfoEditorModel {
		if (item) {
			this.key = item.key;
			this.value = item.value;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, baseProperty: string = null, disabled: boolean = false, validationErrorModel: ValidationErrorModel): FormGroup {
		this.validationErrorModel = validationErrorModel;
		if (context == null) { context = this.createValidationContext(baseProperty); }
		return this.formBuilder.group({
			key: [{ value: this.key, disabled: disabled }, context.getValidation('key').validators],
			value: [{ value: this.value, disabled: disabled }, context.getValidation('value').validators],
		});
	}

	createValidationContext(baseProperty?: string): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'key', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Key'))] });
		baseValidationArray.push({ key: 'value', validators: [Validators.required, BackendErrorValidator(this.validationErrorModel, this.helperGetValidation(baseProperty, 'Value'))] });
		baseContext.validation = baseValidationArray;
		return baseContext;
	}

	helperGetValidation(baseProperty: string, property: string) {
		if (baseProperty) {
			return `${baseProperty}.${property}`;
		} else {
			return property;
		}
	}
}
