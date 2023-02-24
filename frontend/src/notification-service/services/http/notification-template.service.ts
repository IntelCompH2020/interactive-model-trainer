import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationTemplate, NotificationTemplatePersist } from '@notification-service/core/model/notification-template.model';
import { NotificationTemplateLookup } from '@notification-service/core/query/notification-template.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class NotificationTemplateService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/notification-template`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	query(q: NotificationTemplateLookup): Observable<QueryResult<NotificationTemplate>> {
		const url = `${this.apiBase}/query`;

		return this.http
			.post<QueryResult<NotificationTemplate>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<NotificationTemplate> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<NotificationTemplate>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateKind(id: Guid, kind: NotificationTemplateKind): Observable<NotificationTemplate> {
		const url = `${this.apiBase}/${id}/${kind}`;

		return this.http
			.post<NotificationTemplate>(url, {}).pipe(
				catchError((error: any) => throwError(error)));
	}

	persist(item: NotificationTemplatePersist, totp?: string): Observable<NotificationTemplate> {
		const url = `${this.apiBase}/persist`;

		let headers = new HttpHeaders();

		return this.http
			.post<NotificationTemplate>(url, item, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid, totp?: string): Observable<NotificationTemplate> {
		const url = `${this.apiBase}/${id}`;

		let headers = new HttpHeaders();

		return this.http
			.delete<NotificationTemplate>(url, headers ? { headers: headers } : undefined).pipe(
				catchError((error: any) => throwError(error)));
	}
}
