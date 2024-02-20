import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { Topic, TopicModel, TopicModelListing, TopicModelTreeStatus, TopicSimilarity } from '@app/core/model/model/topic-model.model';
import { TopicModelLookup } from '@app/core/query/topic-model.lookup';
import { TopicLookup } from '@app/core/query/topic.lookup';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseHttpService } from '@common/base/base-http.service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { QueryResult } from '@common/model/query-result';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class TopicModelService {

	private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/topic-model`; }

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

	query(q: TopicModelLookup): Observable<QueryResult<TopicModelListing>> {
		const url = `${this.apiBase}/all`;

		return this.http
			.post<QueryResult<TopicModelListing>>(url, q).pipe(
				catchError((error: any) => throwError(error)),
				tap((result) => {
					let models = result.items;
					for (let model of models) model.treeStatus = 'disabled'
					for (let model of models) {
						if (model.submodels && model.submodels.length >= 1) {
							model.treeStatus = 'collapsed';
							models.push(...model.submodels.map(item => { return { ...item, submodels: [], treeStatus: "disabled" as TopicModelTreeStatus } }));
						}
					}
				}));
	}

	get(name: string): Observable<QueryResult<TopicModel>> {
		const url = `${this.apiBase}/${name}`;

		return this.http
			.get<QueryResult<TopicModel>>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	rename(rename: RenamePersist): Observable<void> {
		const url = `${this.apiBase}/rename`;
		return this.http.put<void>(url, rename);
	}

	copy(name: string): Observable<void> {
		const url = `${this.apiBase}/${name}/copy`;
		return this.http.post<void>(url, {});
	}

	update(patch: TopicModelPatch): Observable<void> {
		const url = `${this.apiBase}/${patch.name}/patch`;
		return this.http.patch<void>(url, patch);
	}

	updateHierarchical(parent: string, patch: TopicModelPatch): Observable<void> {
		const url = `${this.apiBase}/${parent}/${patch.name}/patch`;
		return this.http.patch<void>(url, patch);
	}

	delete(name: string): Observable<void> {
		const url = `${this.apiBase}/${name}/delete`;
		return this.http.delete<void>(url);
	}

	reset(name: string): Observable<{ id: string }> {
		const url = `${this.apiBase}/${name}/reset`;
		return this.http.get<{ id: string }>(url);
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

	getHierarchicalTrainLogs(parent: string, name: String): Observable<String[]> {
		const url = `${this.apiBase}/train/logs/${parent}/${name}`;

		return this.http
			.get<String[]>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	queryTopics(name: string, q: TopicLookup): Observable<QueryResult<Topic>> {
		const url = `${this.apiBase}/${name}/topics/all`;

		return this.http
			.post<QueryResult<Topic>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	setTopicLabels(name: string, q: { labels: string[] }): Observable<void> {
		const url = `${this.apiBase}/${name}/topics/labels`;
		return this.http.post<void>(url, q);
	}

	getSimilarTopics(name: string, q: { pairs: number }): Observable<QueryResult<TopicSimilarity>> {
		const url = `${this.apiBase}/${name}/topics/similar`;

		return this.http
			.post<QueryResult<TopicSimilarity>>(url, q).pipe(
				catchError((error: any) => throwError(error)));
	}

	fuseTopics(name: string, q: { topics: number[] }): Observable<void> {
		const url = `${this.apiBase}/${name}/topics/fuse`;
		return this.http.post<void>(url, q);
	}

	sortTopics(name: string): Observable<void> {
		const url = `${this.apiBase}/${name}/topics/sort`;
		return this.http.get<void>(url);
	}

	deleteTopics(name: string, q: { topics: number[] }): Observable<void> {
		const url = `${this.apiBase}/${name}/topics/delete`;
		return this.http.post<void>(url, q);
	}

	pyLDAvisUrl(name: string): Observable<string> {
		const url = `${this.apiBase}/${name}/pyLDAvis.html`;
		return new Observable((observer) => {
			observer.next(url);
			return {
				unsubscribe() { }
			};
		});
	}

	pyLDAvisHierarchicalUrl(parentName: string, name: string): Observable<string> {
		const url = `${this.apiBase}/${parentName}/${name}/pyLDAvis.html`;
		return new Observable((observer) => {
			observer.next(url);
			return {
				unsubscribe() { }
			};
		});
	}

	// pyLDAvis(name: string): Observable<unknown> {
	// 	const url = `${this.apiBase}/${name}/pyLDAvis.html`;
	// 	const headerDict = {
	// 		'Content-Type': 'text/html',
	// 		'Accept': 'text/html'
	// 	}
	// 	const requestOptions = {                                                                                                                                                                                 
	// 		headers: new HttpHeaders(headerDict), 
	// 	};
	// 	return this.http.get(url, requestOptions);
	// }
}

interface TopicModelPatch {
	name: string;
	description: string;
	visibility: ModelVisibility;
}
