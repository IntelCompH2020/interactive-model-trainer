import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BasePendingChangesComponent } from '@common/base/base-pending-changes.component';
import { FormService } from '@common/forms/form-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { NotificationTemplate } from '@notification-service/core/model/notification-template.model';
import { NotificationTemplateService } from '@notification-service/services/http/notification-template.service';
import { NotificationTemplateEditorModel } from '@notification-service/ui/notification-template/editor/notification-template-editor.model';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-notification-template-editor',
	templateUrl: './notification-template-editor.component.html',
	styleUrls: ['./notification-template-editor.component.scss']
})
export class NotificationTemplateEditorComponent extends BasePendingChangesComponent implements OnInit {

	@Input() notificationTemplate: NotificationTemplate;
	@Output() onUpdateKind: EventEmitter<NotificationTemplateKind> = new EventEmitter<NotificationTemplateKind>();
	@Output() onDeleteTemplate: EventEmitter<void> = new EventEmitter<void>();
	@Output() onPersist: EventEmitter<void> = new EventEmitter<void>();
	editorModel: NotificationTemplateEditorModel = null;
	formGroup: FormGroup = null;
	notificationTemplateKindEnum = NotificationTemplateKind;

	constructor(
		public authService: AuthService,
		private notificationTemplateService: NotificationTemplateService,
		private language: TranslateService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private dialog: MatDialog,
		private formService: FormService
	) {
		super();
	}

	ngOnInit(): void {
		this.editorModel = new NotificationTemplateEditorModel().fromModel(this.notificationTemplate);
		this.formGroup = this.editorModel.buildForm(null, this.editorModel.kind === NotificationTemplateKind.Default ? true : !this.authService.hasNotificationServicePermission(NotificationServicePermission.EditNotificationTemplate));
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	public save() {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

			const item = this.formGroup.getRawValue();
			this.notificationTemplateService.persist(item, null).pipe(takeUntil(this._destroyed)).subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	public updateKind(kind: NotificationTemplateKind) {
		this.onUpdateKind.emit(kind);
	}

	public delete() {
		const value = this.formGroup.value;
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					this.onDeleteTemplate.emit();
				}
			});
		}
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.onPersist.emit();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}

	canDeactivate(): boolean | Observable<boolean> {
		return this.formGroup ? !this.formGroup.dirty : true;
	}
}
