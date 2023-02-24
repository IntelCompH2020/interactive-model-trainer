import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { MultipleAutoCompleteComponent } from '@common/modules/auto-complete/multiple/multiple-auto-complete.component';
import { SingleAutoCompleteComponent } from '@common/modules/auto-complete/single/single-auto-complete.component';
import { CommonUiModule } from '@common/ui/common-ui.module';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule
	],
	declarations: [
		SingleAutoCompleteComponent,
		MultipleAutoCompleteComponent
	],
	exports: [
		SingleAutoCompleteComponent,
		MultipleAutoCompleteComponent
	]
})
export class AutoCompleteModule {
	constructor() { }
}
