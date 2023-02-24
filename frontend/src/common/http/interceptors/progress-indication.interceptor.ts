import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { ProgressIndicationService } from '@app/core/services/ui/progress-indication.service';
import { BaseInterceptor } from '@common/http/interceptors/base.interceptor';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ProgressIndicationInterceptor extends BaseInterceptor {

	constructor(
		public installationConfiguration: InstallationConfigurationService,
		private progressIndicationService: ProgressIndicationService) { super(installationConfiguration); }

	get type(): InterceptorType { return InterceptorType.ProgressIndication; }

	interceptRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.progressIndicationService.show();
		return next
			.handle(req).pipe(
				finalize(() => {
					this.progressIndicationService.dismiss();
				}));
	}
}
