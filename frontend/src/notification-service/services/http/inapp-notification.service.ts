import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { InAppNotification } from '@notification-service/core/model/inapp-notification.model';
import { InAppNotificationLookup } from '@notification-service/core/query/inapp-notification.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class InAppNotificationService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/inapp-notification`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: InAppNotificationLookup): Observable<QueryResult<InAppNotification>> {
		const url = `${this.apiBase}/query`;

		return this.http
			.post<QueryResult<InAppNotification>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<InAppNotification> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<InAppNotification>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	read(id: Guid): Observable<void> {
		const url = `${this.apiBase}/${id}/read`;

		return this.http
			.post<void>(url, {}).pipe(
				catchError((error: any) => throwError(error)));
	}

	countUnread(): Observable<number> {
		const url = `${this.apiBase}/count-unread`;
		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};
		const options = { params: params };

		return this.http
			.get<number>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid): Observable<InAppNotification> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<InAppNotification>(url).pipe(
				catchError((error: any) => throwError(error)));
	}
}
