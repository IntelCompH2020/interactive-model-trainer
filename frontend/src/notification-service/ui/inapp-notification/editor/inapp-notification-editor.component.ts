import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { InAppNotification } from '@notification-service/core/model/inapp-notification.model';
import { InAppNotificationService } from '@notification-service/services/http/inapp-notification.service';
import { map, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';

@Component({
	selector: 'app-inapp-notification-editor',
	templateUrl: './inapp-notification-editor.component.html',
	styleUrls: ['./inapp-notification-editor.component.scss']
})
export class InAppNotificationEditorComponent extends BaseComponent implements OnInit {

	isDeleted = false;
	isRead = false;
	isNew = false;
	isFromDialog = false;
	inappNotification: InAppNotification;

	constructor(
		public authService: AuthService,
		private dialog: MatDialog,
		private inappNotificationService: InAppNotificationService,
		private route: ActivatedRoute,
		private router: Router,
		private language: TranslateService,
		public enumUtils: NotificationServiceEnumUtils,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private logger: LoggingService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();
	}

	ngOnInit(): void {
		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const itemId = paramMap.get('id');
			this.isFromDialog = this.route.snapshot.data ? this.route.snapshot.data['isFromDialog'] as boolean : false;

			if (itemId != null) {
				this.inappNotificationService.getSingle(Guid.parse(itemId),
					[
						nameof<InAppNotification>(x => x.id),
						nameof<InAppNotification>(x => x.subject),
						nameof<InAppNotification>(x => x.body),
						nameof<InAppNotification>(x => x.type),
						nameof<InAppNotification>(x => x.trackingState),
						nameof<InAppNotification>(x => x.isActive),
						nameof<InAppNotification>(x => x.hash),
						nameof<InAppNotification>(x => x.updatedAt)
					])
					.pipe(map(data => data as InAppNotification), takeUntil(this._destroyed))
					.subscribe(
						data => {
							this.inappNotification = data;
							this.isDeleted = this.inappNotification.isActive === IsActive.Inactive;
							this.isRead = this.inappNotification.trackingState === NotificationInAppTracking.Delivered;
						},
						error => this.onCallbackError(error)
					);
			} else {
				this.inappNotification = null;
			}
		});
	}

	public markAsRead() {
		const value = this.inappNotification;
		this.inappNotificationService.read(value.id).pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
		// this.clearErrorModel();
	}

	public delete() {
		const value = this.inappNotification;
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				restoreFocus: false,
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
				if (result) {
					this.inappNotificationService.delete(value.id).pipe(takeUntil(this._destroyed))
						.subscribe(
							complete => this.onCallbackSuccess(),
							error => this.onCallbackError(error)
						);
				}
			});
		}
	}

	public cancel(): void {
		this.router.navigate(['/inapp-notifications']);
	}

	onCallbackSuccess(data?: any): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.router.navigate(['/inapp-notifications']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
