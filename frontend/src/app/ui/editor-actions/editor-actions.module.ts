import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { EditorActionsComponent } from '@app/ui/editor-actions/editor-actions.component';
import { FormattingModule } from '@app/core/formatting/formatting.module';

@NgModule({
	imports: [
		CommonUiModule,
		RouterModule
	],
	declarations: [
		EditorActionsComponent
	],
	exports: [
		EditorActionsComponent
	]
})
export class EditorActionsModule { }
