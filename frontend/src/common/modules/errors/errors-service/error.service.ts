import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Event, NavigationError, Router } from '@angular/router';
import { ExternalTracingService } from '@app/core/services/http/external-tracing.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { LoggingService } from '@common/logging/logging-service';
import { BaseService } from '@common/base/base.service';
import { ExternalTraceEntry, ExternalTraceLogLevel } from '@common/modules/errors/external-tracing/external-trace-entry';
import * as StackTraceParser from 'error-stack-parser';
import { of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class ErrorService extends BaseService {

	constructor(
		private injector: Injector,
		private router: Router,
		private externalTracingService: ExternalTracingService,
		private logger: LoggingService,
		private installationConfiguration: InstallationConfigurationService,
		private authService: AuthService
	) {
		super();

		// Subscribe to the NavigationError
		this.router
			.events
			.subscribe((event: Event) => {
				if (event instanceof NavigationError) {
					// Redirect to the ErrorComponent
					this.log(event.error)
						.pipe(takeUntil(this._destroyed))
						.subscribe((errorWithContext) => {
							this.router.navigate(['/error'], { queryParams: errorWithContext });
						});
				}
			});
	}

	log(error) {
		// Log the error to the console
		this.logger.error(error);
		// Send error to server if global error handling logging is enabled
		if (this.installationConfiguration.globalErrorHandlingTransmitLogs) {
			const externalTraceEntry: ExternalTraceEntry = this.prepareExternalTraceEntry(error);
			this.externalTracingService.transmitError(externalTraceEntry).pipe(takeUntil(this._destroyed)).subscribe();
			return of(externalTraceEntry);
		}
		return of(error);
	}

	prepareExternalTraceEntry(error): ExternalTraceEntry {
		// You can include context details here
		const name = error.name || null;
		const appId = this.installationConfiguration.globalErrorHandlingAppName;
		const message = error.message || error.toString();
		const userId = this.authService.userId();
		let user;
		if (userId) { user = userId; }
		const time = new Date().getTime();
		const id = `${appId}-${user}-${time}`;
		const location = this.injector.get(LocationStrategy);
		const url = location instanceof PathLocationStrategy ? location.path() : '';
		const status = error.status || null;
		const stack = error instanceof HttpErrorResponse ? null : StackTraceParser.parse(error);

		const externalTraceEntry: ExternalTraceEntry = {
			eventId: { id: 1000 }, //UnhandledError
			level: ExternalTraceLogLevel.Error,
			message: message,
			data: {
				name: name,
				appId: appId,
				user: user,
				referenceId: id,
				url: url,
				status: status,
				stack: stack
			}
		};
		return externalTraceEntry;
	}

}
