import { Injectable } from '@angular/core';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { KeywordLookup } from '@app/core/query/keyword.lookup';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseHttpService } from '@common/base/base-http.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class KeywordService {

  private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/keywords`; }

  constructor(
    private installationConfiguration: InstallationConfigurationService,
    private http: BaseHttpService) { }

  query(q: KeywordLookup): Observable<QueryResult<Keyword>> {
    const url = `${this.apiBase}/all`;
    return this.http
      .post<QueryResult<Keyword>>(url, q).pipe(
        catchError((error: any) => throwError(error)));
  }

  delete(name: string): Observable<void> {
    const url = `${this.apiBase}/delete/${name}`;
    return this.http.delete<void>(url);
  }

  copy(name: string): Observable<void> {
    const url = `${this.apiBase}/copy/${name}`;
    return this.http.post<void>(url, {});
  }

  create(keyword: Keyword): Observable<void> {
    const url = `${this.apiBase}/create`;
    return this.http.post<void>(url, keyword);
  }

  patch(keyword: Keyword): Observable<void> {
    const url = `${this.apiBase}/patch`;
    return this.http.post<void>(url, keyword);
  }

  rename(rename: RenamePersist): Observable<void> {
    const url = `${this.apiBase}/rename`;
    return this.http.put<void>(url, rename);
  }
}