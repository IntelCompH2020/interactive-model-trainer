import { Injectable } from '@angular/core';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelLookup } from '@app/core/query/domain-model.lookup';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
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

	rename(rename: RenamePersist ): Observable<void>{
    const url = `${this.apiBase}/rename`;
    return this.http.put<void>(url, rename);
  }

	copy(name: string): Observable<void>{
		const url = `${this.apiBase}/${name}/copy`;
    return this.http.post<void>(url, {});
  }

	update(patch: DomainModelPatch): Observable<void> {
		const url = `${this.apiBase}/${patch.name}/patch`;
		return this.http.patch<void>(url, patch);
	}

  delete(name: string): Observable<void>{
		const url = `${this.apiBase}/${name}/delete`;
    return this.http.delete<void>(url);
  }

	train(trainData: any): Observable<{ id: string }> {
		const url = `${this.apiBase}/train`;

		return this.http
			.post<{ id: string }>(url, trainData).pipe(
				catchError((error: any) => throwError(error)));
	}

	getTrainLogs(name: String): Observable<String[]> {
		const url = `${this.apiBase}/train/logs/${name}`;

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};

		return this.http
			.get<String[]>(url, { params: params }).pipe(
				catchError((error: any) => throwError(error)));
	}
}

interface DomainModelPatch {
	name: string;
	description: string;
	visibility: ModelVisibility;
}
