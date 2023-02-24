import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';

//
//
// This is shared module that provides all idp service's services. Its imported only once on the AppModule.
//
//
@NgModule({})
export class CoreIdpServiceModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreIdpServiceModule) {
		if (parentModule) {
			throw new Error(
				'CoreIdpServiceModule is already loaded. Import it in the AppModule only');
		}
	}
	static forRoot(): ModuleWithProviders<CoreIdpServiceModule> {
		return {
			ngModule: CoreIdpServiceModule,
			providers: [
				BaseHttpService,
				UiNotificationService,
				HttpErrorHandlingService,
				FilterService,
				FormService,
				LoggingService
			],
		};
	}
}
