import { NgModule } from "@angular/core";
import { FormattingModule } from "@app/core/formatting/formatting.module";
import { EditorActionsModule } from "@app/ui/editor-actions/editor-actions.module";
import { CommonFormsModule } from "@common/forms/common-forms.module";
import { ConfirmationDialogModule } from "@common/modules/confirmation-dialog/confirmation-dialog.module";
import { TextFilterModule } from "@common/modules/text-filter/text-filter.module";
import { CommonUiModule } from "@common/ui/common-ui.module";
import { TenantChooseDialogComponent } from "./tenant-choose-dialog.component";

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		TextFilterModule,
		FormattingModule,
		EditorActionsModule
	],
	declarations: [
		TenantChooseDialogComponent
	],
	entryComponents: [
		TenantChooseDialogComponent
	]
})
export class TenantChooseDialogModule { }