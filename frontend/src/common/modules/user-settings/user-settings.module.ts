import { NgModule } from '@angular/core';
import { FilterNameDialogComponent } from '@app/ui/filter-name-dialog/filter-name-dialog.component';
import { FilterNameDialogModule } from '@app/ui/filter-name-dialog/filter-name-dialog.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { UserSettingsSelectorComponent } from '@common/modules/user-settings/user-settings-selector/user-settings-selector.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		FilterNameDialogModule,
		ConfirmationDialogModule
	],
	declarations: [
		UserSettingsSelectorComponent
	],
	exports: [
		UserSettingsSelectorComponent
	],
	entryComponents: [
		FilterNameDialogComponent
	]
})
export class UserSettingsModule {
	constructor() { }
}
