import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { BaseHttpService } from '@common/base/base-http.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { CultureService } from '@user-service/services/culture.service';
import { UserSettingsHttpService } from '@user-service/services/http/user-settings-http.service';
import { UserService } from '@user-service/services/http/user.service';
import { LanguageService } from '@user-service/services/language.service';
import { TimezoneService } from '@user-service/services/timezone.service';
import { UserSettingsService } from '@user-service/services/user-settings.service';

//
//
// This is shared module that provides all user service's services. Its imported only once on the AppModule.
//
//

@NgModule({})
export class CoreUserServiceModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreUserServiceModule) {
		if (parentModule) {
			throw new Error(
				'CoreModule is already loaded. Import it in the AppModule only');
		}
	}
	static forRoot(): ModuleWithProviders<CoreUserServiceModule> {
		return {
			ngModule: CoreUserServiceModule,
			providers: [
				BaseHttpService,
				LanguageService,
				CultureService,
				TimezoneService,
				UserService,
				UserSettingsHttpService,
				UserSettingsService,
				UiNotificationService,
				HttpErrorHandlingService,
				FilterService,
				FormService,
				LoggingService,
			],
		};
	}
}
