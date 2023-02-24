import { NgModule } from '@angular/core';
import { LoaderComponent } from '@common/modules/loader/loader.component';
import { CommonUiModule } from '@common/ui/common-ui.module';

@NgModule({
	imports: [
		CommonUiModule
	],
	declarations: [
		LoaderComponent
	],
	exports: [
		LoaderComponent
	]
})
export class LoaderModule {
	constructor() { }
}
