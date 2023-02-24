import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserConsentInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private router: Router) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.UserConsentInterceptor; }

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next
			.handle(req)
			.pipe(
				catchError(error => {
					if (error instanceof HttpErrorResponse) {
						switch ((<HttpErrorResponse>error).status) {
							case 451:
								this.navigateToUserConsents();
						}
						return throwError(error);
					}
				}));
	}

	navigateToUserConsents() {
		this.router.navigate(['/consents']);
	}
}
