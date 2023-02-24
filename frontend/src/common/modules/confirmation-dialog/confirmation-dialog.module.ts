import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { CommonUiModule } from '@common/ui/common-ui.module';

@NgModule({
	imports: [CommonUiModule],
	declarations: [ConfirmationDialogComponent],
	exports: [ConfirmationDialogComponent],
	entryComponents: [ConfirmationDialogComponent]
})
export class ConfirmationDialogModule {
	constructor() { }
}
