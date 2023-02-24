import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { BaseHttpService } from '@common/base/base-http.service';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { InAppNotificationService } from '@notification-service/services/http/inapp-notification.service';
import { NotificationTemplateService } from '@notification-service/services/http/notification-template.service';
import { NotificationService } from '@notification-service/services/http/notification.service';
import { PrincipalService } from '@notification-service/services/http/principal.service';
import { UserNotificationPreferenceService } from '@notification-service/services/http/user-notification-preference.service';

//
//
// This is shared module that provides all notification service's services. Its imported only once on the AppModule.
//
//
@NgModule({})
export class CoreNotificationServiceModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreNotificationServiceModule) {
		if (parentModule) {
			throw new Error(
				'CoreNotificationServiceModule is already loaded. Import it in the AppModule only');
		}
	}
	static forRoot(): ModuleWithProviders<CoreNotificationServiceModule> {
		return {
			ngModule: CoreNotificationServiceModule,
			providers: [
				BaseHttpService,
				UiNotificationService,
				SnackBarCommonNotificationsService,
				HttpErrorHandlingService,
				FilterService,
				FormService,
				LoggingService,
				NotificationService,
				InAppNotificationService,
				PrincipalService,
				NotificationTemplateService,
				UserNotificationPreferenceService
			],
		};
	}
}
