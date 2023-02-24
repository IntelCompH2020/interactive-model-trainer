import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { IdpServiceFormattingModule } from '@idp-service/core/formatting/formatting.module';
import { UserServiceFormattingModule } from '@user-service/core/formatting/formatting.module';
import { UserEditorComponent } from '@user-service/ui/users/editor/user-editor.component';
import { UserRolesEditorComponent } from '@user-service/ui/users/editor/user-roles/user-roles-editor.component';
import { UserListingFiltersComponent } from '@user-service/ui/users/listing/filters/user-listing-filters.component';
import { UserListingComponent } from '@user-service/ui/users/listing/user-listing.component';
import { UserRoutingModule } from '@user-service/ui/users/user-routing.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		UserServiceFormattingModule,
		IdpServiceFormattingModule,
		UserRoutingModule,
		UserSettingsModule,
	],
	declarations: [
		UserListingComponent,
		UserEditorComponent,
		UserListingFiltersComponent,
		UserRolesEditorComponent,
	],
	entryComponents: [
	]
})
export class UserModule { }
