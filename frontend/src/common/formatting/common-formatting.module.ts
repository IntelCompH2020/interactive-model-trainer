import { NgModule } from '@angular/core';
import { DataTableDateFormatPipe, DateFormatPipe } from '@common/formatting/pipes/date-format.pipe';
import { DataTableDateTimeFormatPipe, DateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { DataTableDomainModelTypeFormatPipe } from './pipes/domain-model-type.pipe';
import { SecondsToTimePipe } from './pipes/seconds-to-time.pipe';
import { DataTableTopicModelTypeFormatPipe } from './pipes/topic-model-type.pipe';

//
//
// This is shared module that provides all formatting utils. Its imported only once on the AppModule.
//
//
@NgModule({
	declarations: [
		DateFormatPipe,
		DateTimeFormatPipe,
		DataTableDateFormatPipe,
		DataTableDateTimeFormatPipe,
		DataTableTopicModelTypeFormatPipe,
		DataTableDomainModelTypeFormatPipe,
		SecondsToTimePipe
	],
	exports: [
		DateFormatPipe,
		DateTimeFormatPipe,
		DataTableDateFormatPipe,
		DataTableDateTimeFormatPipe,
		DataTableTopicModelTypeFormatPipe,
		DataTableDomainModelTypeFormatPipe,
		SecondsToTimePipe
	],
	providers: [
		DateFormatPipe,
		DateTimeFormatPipe,
		DataTableDateFormatPipe,
		DataTableDateTimeFormatPipe,
		DataTableTopicModelTypeFormatPipe,
		DataTableDomainModelTypeFormatPipe,
		SecondsToTimePipe
	]
})
export class CommonFormattingModule { }
