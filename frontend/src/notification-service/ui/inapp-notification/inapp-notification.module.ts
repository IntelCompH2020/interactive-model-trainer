import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NotificationServiceFormattingModule } from '@notification-service/core/formatting/formatting.module';
import { InAppNotificationEditorComponent } from '@notification-service/ui/inapp-notification/editor/inapp-notification-editor.component';
import { InAppNotificationRoutingModule } from '@notification-service/ui/inapp-notification/inapp-notification-routing.module';
import { InAppNotificationListingDialogComponent } from '@notification-service/ui/inapp-notification/listing-dialog/inapp-notification-listing-dialog.component';
import { InAppNotificationListingFiltersComponent } from '@notification-service/ui/inapp-notification/listing/filters/inapp-notification-listing-filters.component';
import { InAppNotificationListingComponent } from '@notification-service/ui/inapp-notification/listing/inapp-notification-listing.component';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		NotificationServiceFormattingModule,
		InAppNotificationRoutingModule,
		UserSettingsModule
	],
	declarations: [
		InAppNotificationListingComponent,
		InAppNotificationEditorComponent,
		InAppNotificationListingFiltersComponent,
		InAppNotificationListingDialogComponent
	],
	entryComponents: [
		InAppNotificationListingDialogComponent
	],
	exports: [
		InAppNotificationListingComponent
	]
})
export class InAppNotificationModule { }
