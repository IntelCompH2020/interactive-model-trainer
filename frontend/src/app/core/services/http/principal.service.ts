import { Injectable } from '@angular/core';
import { AppAccount } from '@app/core/model/auth/principal.model';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { Observable } from 'rxjs';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';

@Injectable()
export class PrincipalService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/principal`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService
	) { }

	public me(options?: Object): Observable<AppAccount> {
		const url = `${this.apiBase}/me`;
		return this.http.get<AppAccount>(url, options);
	}

	public myTenants(options?: Object): Observable<Array<string>> {
		const url = `${this.apiBase}/my-tenants`;
		return this.http.get<Array<string>>(url, options);
	}

}
