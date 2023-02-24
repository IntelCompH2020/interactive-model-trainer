import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { AuthService } from '@app/core/services/ui/auth.service';

@Injectable()
export class ErrorHandlerInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private uiNotificationService: UiNotificationService,
		private authService: AuthService,
	) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.ErrorHandlerInterceptor; }


	isApplied(req: HttpRequest<any>): boolean {

		if (super.isApplied(req)) {
			return true;
		}
		return false;
	}

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


		return next.handle(req).pipe(
			catchError(e => {
				const error: HttpError = this.httpErrorHandlingService.getError(e);
				if (error.statusCode === 400) {

					try {
						if (
							(req.params as BaseHttpParams).interceptorContext.interceptorParams// has any interceptor params
							.find(x => x.type === this.type && x.serviceEndpoints.find(endpoint => req.url.startsWith(endpoint))) // has any interceptor param with current interceptor type and current endpoint
							.overrideErrorCodes.includes(error.errorCode) // apply error code filtering
							) {
							return throwError(e);
						}
					} catch {}

					const engage = true;
					const feedbackMethod: FeedbackMethod = FeedbackMethod.SnackBar;
					const messages: string[] = [error.getMessagesString()];
					const title = '';
					const subTitle = '';



					if (engage && feedbackMethod !== undefined && feedbackMethod !== null) {
						switch (feedbackMethod) {
							// case FeedbackMethod.Dialog:
							// 	this.uiNotificationService.popupNotification(title, subTitle, ...messages);
							// 	break;
							case FeedbackMethod.SnackBar:
								this.uiNotificationService.snackBarNotification(messages.join(''), SnackBarNotificationLevel.Error);
								break;
						}
					}

				}
				if (error.statusCode === 403 && error.errorCode === 113) {
					this.authService.selectedTenant(null);
				}
				return throwError(e);
			}));
	}
}

enum FeedbackMethod {
	SnackBar = 0,
	Dialog = 1
}
