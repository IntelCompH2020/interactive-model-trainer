import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { NotifierListConfigurationDataContainer } from '@notification-service/core/model/tenant-configuration.model';
import { UserNotificationPreference, UserNotificationPreferencePersist } from '@notification-service/core/model/user-notification-preference.model';
import { NotifierListLookup } from '@notification-service/core/query/notifier-list.lookup';
import { UserNotificationPreferenceLookup } from '@notification-service/core/query/user-notification-preference.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserNotificationPreferenceService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/notification-preference`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: UserNotificationPreferenceLookup): Observable<QueryResult<UserNotificationPreference>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<UserNotificationPreference>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	current(id: Guid, reqFields: string[] = []): Observable<UserNotificationPreference[]> {
		const url = `${this.apiBase}/user/${id}/current`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<UserNotificationPreference[]>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	getNotifierList(q: NotifierListLookup): Observable<NotifierListConfigurationDataContainer> {
		const url = `${this.apiBase}/notifier-list/available`;
		return this.http
			.post<NotifierListConfigurationDataContainer>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	persist(item: UserNotificationPreferencePersist, totp?: string): Observable<UserNotificationPreference> {
		const url = `${this.apiBase}/persist`;

		let headers = new HttpHeaders();

		return this.http
			.post<UserNotificationPreference>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}
}
