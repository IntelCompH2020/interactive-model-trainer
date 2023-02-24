
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from '@common/modules/errors/errors-service/error.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorsHandler implements ErrorHandler {

	private _notificationService;
	private _errorService;
	private _router;
	private _language;

	constructor(
		private injector: Injector,
	) {

	}

	handleError(error: Error | HttpErrorResponse) {
		this._notificationService = this.injector.get(UiNotificationService);
		this._errorService = this.injector.get(ErrorService);
		this._router = this.injector.get(Router);
		this._language = this.injector.get(TranslateService);

		if (error instanceof HttpErrorResponse) {
			// Server error happened
			if (!navigator.onLine) {
				// No Internet connection
				return this._notificationService.snackBarNotification(this._language.instant('ERROR-HANDLER.GLOBAL.NO-INTERNET'), SnackBarNotificationLevel.Error);
			}
			// Http Error
			// Send the error to the server
			this._errorService.log(error).subscribe();
			// Show notification to the user
			return this._notificationService.snackBarNotification(`${error.status} - ${error.message}`, SnackBarNotificationLevel.Error);
		} else {
			// Client Error Happend
			// Send the error to the server and then
			// redirect the user to the page with all the info
			this._errorService
				.log(error)
				.subscribe(errorWithContextInfo => {
					this._router.navigate(['/error'], { queryParams: errorWithContextInfo });
				});
		}
	}
}

