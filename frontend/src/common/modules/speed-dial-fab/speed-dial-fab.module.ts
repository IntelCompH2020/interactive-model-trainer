import { NgModule } from '@angular/core';
import { SpeedDialFabComponent } from '@common/modules/speed-dial-fab/speed-dial-fab.component';
import { CommonUiModule } from '@common/ui/common-ui.module';

@NgModule({
	imports: [
		CommonUiModule
	],
	declarations: [
		SpeedDialFabComponent
	],
	exports: [
		SpeedDialFabComponent
	]
})
export class SpeedDialFabModule {
	constructor() { }
}
