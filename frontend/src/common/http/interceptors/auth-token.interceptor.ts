import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private authService: AuthService) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.AuthToken; }

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const authToken: String = this.authService.currentAuthenticationToken();
		if (!authToken) { return next.handle(req); }

		// let newParams = new HttpHeaders({ fromString: req.headers.toString() });

		// // Add any params (can also chain .append() but I was conditionally adding params)
		// newParams = newParams.append('Authorization', `Bearer ${authToken}`);

		// // Clone the request with params instead of setParams
		// const requestClone = req.clone({
		// 	headers: newParams
		// });
		req = req.clone({
			setHeaders: {
				Authorization: `Bearer ${authToken}`
			}
		});
		return next.handle(req);
	}
}
