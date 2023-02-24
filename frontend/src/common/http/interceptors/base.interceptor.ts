import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable } from 'rxjs';

export abstract class BaseInterceptor implements HttpInterceptor {

	constructor(public installationConfiguration: InstallationConfigurationService) { }

	abstract type: InterceptorType;
	abstract interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (this.isApplied(req)) {
			return this.interceptRequest(req, next);
		}
		return next.handle(req);
	}

	isApplied(req: HttpRequest<any>): boolean {

		if (req.params instanceof BaseHttpParams && req.params.interceptorContext && Array.isArray(req.params.interceptorContext.excludedInterceptors) && req.params.interceptorContext.excludedInterceptors.includes(this.type)) {
			return false;
		}

		return (req.params instanceof BaseHttpParams && req.params.interceptorContext && Array.isArray(req.params.interceptorContext.interceptAllRequests) && req.params.interceptorContext.interceptAllRequests.includes(this.type))
			|| req.url.startsWith(this.installationConfiguration.idpServiceAddress)
			|| req.url.startsWith(this.installationConfiguration.notificationServiceAddress)
			|| req.url.startsWith(this.installationConfiguration.appServiceAddress);
	}
}
