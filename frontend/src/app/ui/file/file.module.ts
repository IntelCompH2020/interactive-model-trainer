import { NgModule } from "@angular/core";
import { CommonUiModule } from "@common/ui/common-ui.module";
import { FileExportDialogComponent } from "./file-export-dialog.component";

@NgModule({
	imports: [CommonUiModule],
	declarations: [FileExportDialogComponent],
	exports: [FileExportDialogComponent],
  entryComponents: [FileExportDialogComponent]
})
export class FileModule { }