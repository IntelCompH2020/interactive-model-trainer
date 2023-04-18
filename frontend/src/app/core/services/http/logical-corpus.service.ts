import { Injectable } from '@angular/core';
import { LogicalCorpus, LogicalCorpusPersist } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class LogicalCorpusService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/logical-corpus`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	query(q: LogicalCorpusLookup): Observable<QueryResult<LogicalCorpus>> {
		const url = `${this.apiBase}/all`;
		return this.http
			.post<QueryResult<LogicalCorpus>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	create(corpus: LogicalCorpusPersist): Observable<void> {
		const url = `${this.apiBase}/create`;
		return this.http.post<void>(url, corpus);
	}

	delete(name: string): Observable<void> {
    const url = `${this.apiBase}/delete/${name}`;
    return this.http.delete<void>(url);
  }

	rename(rename: RenamePersist): Observable<void> {
		const url = `${this.apiBase}/rename`;
		return this.http.put<void>(url, rename);
	}
}
