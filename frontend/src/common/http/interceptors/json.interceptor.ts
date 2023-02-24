import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable } from 'rxjs';

@Injectable()
export class JsonInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
	) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.JSONContentType; }

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (!req.headers.has('Content-Type')) { req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') }); }
		if (!req.headers.has('Accept')) { req = req.clone({ headers: req.headers.set('Accept', 'application/json') }); }

		return next.handle(req);
	}

}
