import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { BaseComponent } from '@common/base/base.component';
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';
import { InAppNotification } from '@notification-service/core/model/inapp-notification.model';
import { InAppNotificationLookup } from '@notification-service/core/query/inapp-notification.lookup';
import { InAppNotificationService } from '@notification-service/services/http/inapp-notification.service';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-inapp-notification-listing-dialog',
	templateUrl: './inapp-notification-listing-dialog.component.html',
	styleUrls: ['./inapp-notification-listing-dialog.component.scss']
})
export class InAppNotificationListingDialogComponent extends BaseComponent implements OnInit {
	public inappNotifications = new Array<InAppNotification>();
	public notificationInAppTrackingEnum = NotificationInAppTracking;

	constructor(
		public dialogRef: MatDialogRef<InAppNotificationListingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public dialogData: any,
		private inappNotificationService: InAppNotificationService,
		private router: Router,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		public authService: AuthService,
	) {
		super();
	}

	ngOnInit() {
		const lookup = new InAppNotificationLookup();
		lookup.project = {
			fields: [
				nameof<InAppNotification>(x => x.id),
				nameof<InAppNotification>(x => x.subject),
				nameof<InAppNotification>(x => x.createdAt),
				nameof<InAppNotification>(x => x.trackingState),
			]
		};
		 lookup.page = { offset: 0, size: 10 };
		lookup.order = { items: ['-' + nameof<InAppNotification>(x => x.createdAt)] };
		this.inappNotificationService.query(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					this.inappNotifications = data.items;
				},
				error => this.onCallbackError(error),
			);
	}

	private onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}

	goToNotification(item: InAppNotification) {
		if (item.trackingState === NotificationInAppTracking.Stored) {
			this.inappNotificationService.read(item.id)
				.pipe(takeUntil(this._destroyed))
				.subscribe(
					data => {
						this.dialogRef.close();
						this.router.navigate(['/inapp-notifications/dialog/' + item.id]);
					},
					error => {
						this.dialogRef.close();
						this.router.navigate(['/inapp-notifications/dialog/' + item.id]);
					},
				);
		} else {
			this.dialogRef.close();
			this.router.navigate(['/inapp-notifications/dialog/' + item.id]);
		}
	}

	goToNotifications() {
		this.router.navigate(['/inapp-notifications']);
		this.dialogRef.close();
	}
}
