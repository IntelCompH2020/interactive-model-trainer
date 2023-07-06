import { NgModule } from "@angular/core";
import { CommonFormsModule } from "@common/forms/common-forms.module";
import { CommonUiModule } from "@common/ui/common-ui.module";
import { MarkdownDialogComponent } from "./markdown-dialog.component";
import { MarkdownModule } from "ngx-markdown";

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
    MarkdownModule.forChild()
	],
	declarations: [MarkdownDialogComponent],
	exports: [MarkdownDialogComponent],
  entryComponents: [MarkdownDialogComponent]
})
export class MarkdownDialogModule { }