import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { AutoCompleteModule } from '@common/modules/auto-complete/auto-complete.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NotificationServiceFormattingModule } from '@notification-service/core/formatting/formatting.module';
import { NotificationListingFiltersComponent } from '@notification-service/ui/notification/listing/filters/notification-listing-filters.component';
import { NotificationListingComponent } from '@notification-service/ui/notification/listing/notification-listing.component';
import { NotificationRoutingModule } from '@notification-service/ui/notification/notification-routing.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		NotificationServiceFormattingModule,
		NotificationRoutingModule,
		AutoCompleteModule,
		UserSettingsModule
	],
	declarations: [
		NotificationListingComponent,
		NotificationListingFiltersComponent
	]
})
export class NotificationModule { }
