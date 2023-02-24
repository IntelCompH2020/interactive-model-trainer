import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { NotificationServiceAccount } from '@notification-service/core/model/principal.model';
import { Observable } from 'rxjs';

@Injectable()
export class PrincipalService {

	private get apiBase(): string { return `${this.installationConfiguration.notificationServiceAddress}api/notification/principal`; }	

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public me(options?: Object): Observable<NotificationServiceAccount> {
		const url = `${this.apiBase}/me`;
		return this.http.get<NotificationServiceAccount>(url, options);
	}
}
