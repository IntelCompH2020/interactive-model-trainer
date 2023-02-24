import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { NotificationFieldInfoEditorModel, NotificationFieldOptionsEditorModel } from '@notification-service/ui/notification-template/editor/notification-template-editor.model';

@Component({
	selector: 'app-notification-template-field-options-editor',
	templateUrl: './field-options-editor.component.html',
	styleUrls: ['./field-options-editor.component.scss']
})
export class NotificationTemplateFieldOptionsEditorComponent extends BaseComponent implements OnInit {

	@Input() formGroup: FormGroup;
	@Input() validationErrorModel: ValidationErrorModel;

	constructor(
		private formService: FormService
	) {
		super();
	}

	ngOnInit(): void {
	}

	addMandatoryItem() {
		const itemsArray: FormArray = this.formGroup.get('mandatory') as FormArray;
		const editorModel = new NotificationFieldOptionsEditorModel();
		editorModel.validationErrorModel = this.validationErrorModel;
		itemsArray.push(editorModel.buildMandatoryItemForm(undefined, itemsArray.length, false, '')); //TODO backend validation incorrect.
	}

	removeMandatoryItem(index: number) {
		const itemsArray: FormArray = this.formGroup.get('mandatory') as FormArray;
		itemsArray.controls.splice(index, 1);
		const editorModel = new NotificationFieldOptionsEditorModel();
		editorModel.validationErrorModel = this.validationErrorModel;
		editorModel.helperReapplyMandatoryItemsValidators(itemsArray);
	}

	addOptionalItem() {
		const itemsArray: FormArray = this.formGroup.get('option') as FormArray;
		const editorModel = new NotificationFieldOptionsEditorModel();
		editorModel.validationErrorModel = this.validationErrorModel;
		itemsArray.push(editorModel.buildOptionalItemForm(new NotificationFieldInfoEditorModel(), itemsArray.length, false));
	}

	removeOptionalItem(index: number) {
		const itemsArray: FormArray = this.formGroup.get('option') as FormArray;
		itemsArray.controls.splice(index, 1);
		const editorModel = new NotificationFieldOptionsEditorModel();
		editorModel.validationErrorModel = this.validationErrorModel;
		editorModel.helperReapplyOptionalItemsValidators(itemsArray);
	}
}
