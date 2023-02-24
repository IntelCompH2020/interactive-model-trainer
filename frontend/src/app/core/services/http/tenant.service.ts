import { Injectable } from '@angular/core';
import { Tenant, TenantPersist } from '@app/core/model/tenant/tenant.model';
import { TenantLookup } from '@app/core/query/tenant.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TenantService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/tenant`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	query(q: TenantLookup): Observable<QueryResult<Tenant>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<Tenant>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<Tenant> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<Tenant>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	persist(item: TenantPersist): Observable<Tenant> {
		const url = `${this.apiBase}/persist`;

		const params = new BaseHttpParams();
		params.interceptorContext = {
			interceptorParams: [
				{
					type: InterceptorType.ErrorHandlerInterceptor,
					overrideErrorCodes: [101],
					serviceEndpoints: [this.installationConfiguration.appServiceAddress]
				}
			]
		};

		return this.http
			.post<Tenant>(url, item, { params: params }).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid): Observable<Tenant> {
		const url = `${this.apiBase}/${id}`;

		return this.http
			.delete<Tenant>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	generateFile(q: TenantLookup): Observable<Boolean> {
		const url = `${this.apiBase}/generate-report`;
		return this.http
			.post<Boolean>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	generateAndDownloadFile(q: TenantLookup): Observable<Blob> {
		const url = `${this.apiBase}/generate-and-download-report`;

		return this.http
			.post<Blob>(url, q, { responseType: 'blob' }).pipe(
				catchError((error: any) => throwError(error)));
	}
}
