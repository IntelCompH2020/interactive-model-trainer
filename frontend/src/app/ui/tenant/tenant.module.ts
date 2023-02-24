import { NgModule } from '@angular/core';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { EditorActionsModule } from '@app/ui/editor-actions/editor-actions.module';
import { UserSettingsModule } from '@common/modules/user-settings/user-settings.module';
import { TenantRoutingModule } from './tenant-routing.module';
import { TenantListingComponent } from './listing/tenant-listing.component';
import { TenantListingFiltersComponent } from './listing/filters/tenant-listing-filters.component';
import { TenantEditorComponent } from './editor/tenant-editor.component';


@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		FormattingModule,
		TenantRoutingModule,
		EditorActionsModule,
		UserSettingsModule
	],
	declarations: [
		TenantListingComponent,
		TenantEditorComponent,
		TenantListingFiltersComponent
	]
})
export class TenantModule { }
