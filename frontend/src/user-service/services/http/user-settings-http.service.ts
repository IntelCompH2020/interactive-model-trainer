import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { Guid } from '@common/types/guid';
import { UserSettings, UserSettingPersist } from '@user-service/core/model/user-settings.model';
import { Observable } from 'rxjs';

@Injectable()
export class UserSettingsHttpService {
	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/user/user-settings`; }

	getSingle(key: string): Observable<UserSettings> {
		const url = `${this.apiBase}/${key}`;

		return this.http.get<UserSettings>(url);
	}

	persist(item: UserSettingPersist): Observable<UserSettings> {
		const url = `${this.apiBase}/persist`;

		return this.http.post<UserSettings>(url, item);
	}

	persistAll(items: UserSettingPersist[]): Observable<UserSettings[]> {
		const url = `${this.apiBase}/persist-all-default`;

		return this.http.post<UserSettings[]>(url, items);
	}

	delete(id: Guid): Observable<UserSettings> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<UserSettings>(url);
	}
}
