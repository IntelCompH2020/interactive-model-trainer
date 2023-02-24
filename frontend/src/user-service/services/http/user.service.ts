import { Injectable } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Guid } from '@common/types/guid';
import { UserContactInfoPatch, UserProfileLanguagePatch, UserServiceNamePatch, UserServiceUser, UserServiceUserPersist, UserServiceUserProfile, UserServiceUserProfilePersist } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/user/user`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	public query(q: UserLookup): Observable<QueryResult<UserServiceUser>> {
		const url = `${this.apiBase}/query`;
		return this.http
			.post<QueryResult<UserServiceUser>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	getSingle(id: Guid, reqFields: string[] = []): Observable<UserServiceUser> {
		const url = `${this.apiBase}/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<UserServiceUser>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	persist(item: UserServiceUserPersist): Observable<UserServiceUser> {
		const url = `${this.apiBase}/persist`;

		return this.http
			.post<UserServiceUser>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	delete(id: Guid): Observable<UserServiceUser> {
		const url = `${this.apiBase}/${id}`;
		return this.http
			.delete<UserServiceUser>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserLanguage(item: UserProfileLanguagePatch): Observable<UserServiceUserProfile> {
		const url = `${this.apiBase}/language`;
		return this.http
			.post<UserServiceUserProfile>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	getUserProfile(id: Guid, reqFields: string[] = []): Observable<UserServiceUserProfile> {
		const url = `${this.apiBase}/profile/${id}`;
		const options = { params: { f: reqFields } };

		return this.http
			.get<UserServiceUserProfile>(url, options).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserProfile(item: UserServiceUserProfilePersist): Observable<UserServiceUserProfile> {
		const url = `${this.apiBase}/profile/update`;

		return this.http
			.post<UserServiceUserProfile>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserProfilePicture(image: Blob): Observable<string> {
		const url = `${this.apiBase}/profile-picture`;

		const formData = new FormData();
		formData.append('file', image);

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.JSONContentType]
		};

		return this.http
			.post<string>(url, formData, { params: params, responseType: 'text' }).pipe(
				catchError((error: any) => throwError(error)));
	}

	getProfilePicture(fileRef: string) {
		return this.http
			.get<Blob>(this.getProfilePictureUrl(fileRef), { responseType: 'blob' }).pipe(
				catchError((error: any) => throwError(error)));
	}

	getProfilePictureUrl(fileRef: string) {
		const url = `${this.apiBase}/profile-picture/${fileRef}`;
		return url;
	}

	updateUserName(item: UserServiceNamePatch): Observable<UserServiceUser> {
		const url = `${this.apiBase}/name/update`;

		return this.http
			.post<UserServiceUser>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}

	updateUserProfileContacts(item: UserContactInfoPatch): Observable<UserServiceUser> {
		const url = `${this.apiBase}/contacts/update`;

		return this.http
			.post<UserServiceUser>(url, item).pipe(
				catchError((error: any) => throwError(error)));
	}
}
