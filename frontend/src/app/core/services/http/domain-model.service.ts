import { Injectable } from '@angular/core';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelLookup } from '@app/core/query/domain-model.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DomainModelService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/domain-model`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	query(q: DomainModelLookup): Observable<QueryResult<DomainModel>> {
		const url = `${this.apiBase}/all`;

		return this.http
			.post<QueryResult<DomainModel>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}
}
