import { Injectable } from "@angular/core";
import { BaseHttpService } from "@common/base/base-http.service";
import { BaseHttpParams } from "@common/http/base-http-params";
import { InterceptorType } from "@common/http/interceptors/interceptor-type";
import { InstallationConfigurationService } from "@common/installation-configuration/installation-configuration.service";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { RunningTaskQueueItem, RunningTaskType } from "../ui/running-tasks-queue.service";
import { QueryResult } from "@common/model/query-result";

@Injectable()
export class RunningTasksService {

  private get apiBase(): string { return `${this.installationConfiguration.appServiceAddress}api/tasks`; }

  constructor(
		private installationConfiguration: InstallationConfigurationService,
		private http: BaseHttpService) { }

  getTaskStatus(task: string): Observable<string> {
		const url = `${this.apiBase}/${task}/status`;

		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};

		return this.http
			.get<string>(url, { params: params }).pipe(
				catchError((error: any) => throwError(error)));
	}

  getRunningTasks(type: RunningTaskType): Observable<QueryResult<RunningTaskQueueItem>> {
    const url = `${this.apiBase}/${type}/running`;

    const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.ProgressIndication]
		};

    return this.http
			.get<QueryResult<RunningTaskQueueItem>>(url, { params: params }).pipe(
				catchError((error: any) => throwError(error)));
  }

	clearFinishedTask(task: string): Observable<void> {
		const url = `${this.apiBase}/${task}/clear`;

		return this.http
			.get<void>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

	clearAllFinishedTasks(type: RunningTaskType): Observable<void> {
		const url = `${this.apiBase}/${type}/clear-all`;

		return this.http
			.get<void>(url).pipe(
				catchError((error: any) => throwError(error)));
	}

}