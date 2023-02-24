import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { TimePickerComponent } from '@common/modules/time-picker/time-picker.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { DpDatePickerModule } from 'ng2-date-picker';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		DpDatePickerModule
	],
	declarations: [
		TimePickerComponent
	],
	exports: [
		TimePickerComponent
	]
})
export class TimePickerModule {
	constructor() { }
}
