import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextFilterComponent } from '@common/modules/text-filter/text-filter.component';
import { CommonUiModule } from '@common/ui/common-ui.module';

@NgModule({
	imports: [
		CommonUiModule,
		FormsModule
	],
	declarations: [
		TextFilterComponent
	],
	exports: [
		TextFilterComponent
	]
})
export class TextFilterModule {
	constructor() { }
}
