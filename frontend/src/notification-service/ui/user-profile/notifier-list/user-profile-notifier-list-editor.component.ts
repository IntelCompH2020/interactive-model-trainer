import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { UserNotificationPreference } from '@notification-service/core/model/user-notification-preference.model';
import { NotifierListLookup } from '@notification-service/core/query/notifier-list.lookup';
import { UserNotificationPreferenceService } from '@notification-service/services/http/user-notification-preference.service';
import { UserProfileNotifierListEditorModel } from '@notification-service/ui/user-profile/notifier-list/user-profile-notifier-list-editor.model';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-tenant-configuration-user-profile-notifier-list-editor',
	templateUrl: './user-profile-notifier-list-editor.component.html',
	styleUrls: ['./user-profile-notifier-list-editor.component.scss']
})
export class UserProfileNotifierListEditorComponent extends BaseComponent implements OnInit {

	formGroup: FormGroup;
	editorModel: UserProfileNotifierListEditorModel;
	availableNotifiers: { [key: string]: ContactType[] } = {};
	availableNotifiersKeys: NotificationType[];

	constructor(
		private userNotificationPreferenceService: UserNotificationPreferenceService,
		private uiNotificationService: UiNotificationService,
		private language: TranslateService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private authService: AuthService,
		private formService: FormService,
		private logger: LoggingService,
		public notificationServiceEnumUtils: NotificationServiceEnumUtils,
	) {
		super();
	}

	ngOnInit(): void {
		this.getConfiguration();
	}

	getConfiguration() {
		this.formGroup = null;
		this.userNotificationPreferenceService.getNotifierList(new NotifierListLookup())
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					try {
						this.availableNotifiers = data.notifiers;
						this.availableNotifiersKeys = Object.keys(this.availableNotifiers) as NotificationType[];
						this.getExistingSelections();
					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	getExistingSelections() {

		this.userNotificationPreferenceService.current(this.authService.userId(), [
			nameof<UserNotificationPreference>(x => x.userId),
			nameof<UserNotificationPreference>(x => x.type),
			nameof<UserNotificationPreference>(x => x.channel),
			nameof<UserNotificationPreference>(x => x.ordinal),
		])
			.pipe(takeUntil(this._destroyed)).subscribe(
				data => {
					try {
						if (data.length > 0) {
							this.orderAvailableItemsbasedOnExistingSelections(data);
						}
					} catch {
						this.logger.error('Could not parse Dataset: ' + data);
						this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
					}
				},
				error => this.onCallbackError(error)
			);
	}

	orderAvailableItemsbasedOnExistingSelections(notificationPreferences: UserNotificationPreference[]) {
		if (!notificationPreferences || notificationPreferences.length === 0) { return; }
		this.availableNotifiersKeys.forEach(key => {
			const orderedList = [];
			orderedList.push(...(notificationPreferences.filter(x => x.type === key && this.availableNotifiers[key].includes(x.channel)).sort((n1, n2) => n1.ordinal - n2.ordinal).map(x => x.channel))); // First push the selected ordered values.
			orderedList.push(...this.availableNotifiers[key].filter(x => !orderedList.includes(x))); //Then push the rest items.
			this.availableNotifiers[key] = orderedList;
		});
	}

	formSubmit(): void {
			this.persist(null);
	}

	private persist(totp?: string) {
		const persistValue = { notificationPreferences: this.availableNotifiers, userId: this.authService.userId() };

		this.userNotificationPreferenceService.persist(persistValue, totp)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				response => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.getConfiguration();
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		this.editorModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	dropped(event: CdkDragDrop<string[]>, type: NotificationType) {
		moveItemInArray(this.availableNotifiers[type], event.previousIndex, event.currentIndex);
	}
}
