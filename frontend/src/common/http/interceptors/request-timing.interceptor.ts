import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { LoggingService } from '@common/logging/logging-service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestTimingInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private logger: LoggingService) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.RequestTiming; }

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const started = Date.now();
		return next
			.handle(req).pipe(
				tap(event => {
					if (event instanceof HttpResponse) {
						const elapsed = Date.now() - started;
						if (req.method === 'POST') {
							this.logger.info(`POST Request at ${req.url} with params: ${req.serializeBody()} took ${elapsed} ms.`);
						} else {
							this.logger.info(`${req.method} Request at ${req.urlWithParams} took ${elapsed} ms.`);
						}
					}
				}));
	}
}
