import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { ExternalTraceEntry } from '@common/modules/errors/external-tracing/external-trace-entry';
import { Observable } from 'rxjs';

@Injectable()
export class ExternalTracingService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/external-tracing`; }

	constructor(
		private http: BaseHttpService,
		private installationConfiguration: InstallationConfigurationService
	) { }

	public transmitError(externalTraceEntry: ExternalTraceEntry): Observable<void> {
		const url = `${this.apiBase}/log`;

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};

		return this.http
			.post<void>(url, externalTraceEntry);
	}
}
