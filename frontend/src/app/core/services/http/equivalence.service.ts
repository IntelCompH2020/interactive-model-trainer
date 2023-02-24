import { Injectable } from '@angular/core';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { EquivalenceLookup } from '@app/core/query/equivalence.lookup';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class EquivalenceService {

  private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/equivalencies`; }

  constructor(
    private installationConfiguration: InstallationConfigurationService,
    private http: BaseHttpService) { }

  query(q: EquivalenceLookup): Observable<QueryResult<Equivalence>> {
    const url = `${this.apiBase}/all`;

    return this.http
      .post<QueryResult<Equivalence>>(url, q).pipe(
        catchError((error: any) => throwError(error)));
  }
  create(equivalence: Equivalence): Observable<void>{
    const url = `${this.apiBase}/create`;
    return this.http.post<void>(url, equivalence);
  }

  rename(renameKeywordListist: RenameEquivalence ): Observable<void>{
    const url = `${this.apiBase}/rename`;
    return this.http.put<void>(url, renameKeywordListist);
  }

  delete(name: string): Observable<void>{
		const url = `${this.apiBase}/delete/${name}`;
    return this.http.delete<void>(url);
  }

}

interface RenameEquivalence{
  oldName: string;
  newName: string;
}