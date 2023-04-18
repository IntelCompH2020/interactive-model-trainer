import { NgModule } from "@angular/core";
import { CommonFormsModule } from "@common/forms/common-forms.module";
import { CommonUiModule } from "@common/ui/common-ui.module";
import { RenameDialogComponent } from "./rename-dialog.component";

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule
	],
	declarations: [RenameDialogComponent],
	exports: [RenameDialogComponent],
  entryComponents: [RenameDialogComponent]
})
export class RenameDialogModule { }