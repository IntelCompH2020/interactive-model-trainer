import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { Notification } from '@notification-service/core/model/notification.model';
import { NotificationLookup } from '@notification-service/core/query/notification.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class NotificationService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/notification`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: NotificationLookup): Observable<QueryResult<Notification>> {
		const url = `${this.apiBase}/query`;

		return this.http
			.post<QueryResult<Notification>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<Notification> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<Notification>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid, ): Observable<Notification> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<Notification>(url).pipe(
				catchError((error: any) => throwError(error)));
	}
}
