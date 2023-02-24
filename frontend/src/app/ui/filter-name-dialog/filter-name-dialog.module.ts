import { FilterNameDialogComponent } from '@app/ui/filter-name-dialog/filter-name-dialog.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { FormattingModule } from '@app/core/formatting/formatting.module';



@NgModule({
	imports: [
		CommonUiModule,
		MatDialogModule,
		CommonFormsModule,
		FormattingModule,
	],
	declarations: [
		FilterNameDialogComponent
	],
	exports: [
		FilterNameDialogComponent
	]
})
export class FilterNameDialogModule {
	constructor() { }
}
