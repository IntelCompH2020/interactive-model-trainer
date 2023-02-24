import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { DataTableHeaderFormattingService } from '@common/modules/listing/data-table-header-formatting-service';
import { ListingSettingsDialogComponent } from '@common/modules/listing/listing-settings/listing-settings-dialog.component';
import { ListingComponent } from '@common/modules/listing/listing.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FilterEditorComponent } from './filter-editor/filter-editor.component';

@NgModule({
	imports: [
		CommonUiModule,
		FormsModule,
		FormattingModule,
		NgxDatatableModule,
		CommonFormsModule
	],
	declarations: [
		ListingComponent,
		ListingSettingsDialogComponent,
  		FilterEditorComponent
	],
	exports: [
		ListingComponent,
		FilterEditorComponent
	],
	entryComponents: [
		ListingSettingsDialogComponent
	],
	providers: [
		DataTableHeaderFormattingService
	]
})
export class ListingModule {
	constructor() { }
}
