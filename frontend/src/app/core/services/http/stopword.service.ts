import { Injectable } from '@angular/core';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { StopwordLookup } from '@app/core/query/stopword.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class StopwordService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/stopwords`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	query(q: StopwordLookup): Observable<QueryResult<Stopword>> {
		const url = `${this.apiBase}/all`;


        // const queryResult: QueryResult<Stopword> = {
        //     count: 6,
        //     items:
            
        //     Array(6).fill(0).map((_, index) =>({
        //       creator: 'Stopword Creator' + index,
        //       name: 'Stopword' + index,
        //       location: 'Stopword Land' + index,
        //       createdAt: new Date()
        //     })) as Stopword[]
        // }
    
        // return of(queryResult);

		return this.http
			.post<QueryResult<Stopword>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

  create(stopword: Stopword): Observable<void>{
    const url = `${this.apiBase}/create`;
    return this.http.post<void>(url, stopword);
  }

  rename(renameKeywordListist: RenameStopword ): Observable<void>{
    const url = `${this.apiBase}/rename`;
    return this.http.put<void>(url, renameKeywordListist);
  }

  delete(name: string): Observable<void>{
		const url = `${this.apiBase}/delete/${name}`;
    return this.http.delete<void>(url);
  }

}

interface RenameStopword{
  oldName: string;
  newName: string;
}