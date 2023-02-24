import { Injectable } from '@angular/core';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { RawCorpus } from '@app/core/model/corpus/raw-corpus.model';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

@Injectable()
export class RawCorpusService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/raw-corpus`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
    private enumUtils: AppEnumUtils,
		private http: BaseHttpService) {
    }

	query(q: RawCorpusLookup): Observable<QueryResult<RawCorpus>> {
		const url = `${this.apiBase}/all`;

		return this.http
			.post<QueryResult<RawCorpus>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

  // create(corpus: RawCorpus): Observable<void>{
  //   const url = `${this.apiBase}/create`;
  //   return this.http.post<void>(url, corpus);
  // }

}