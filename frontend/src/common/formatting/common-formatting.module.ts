import { NgModule } from '@angular/core';
import { DataTableDateFormatPipe, DateFormatPipe } from '@common/formatting/pipes/date-format.pipe';
import { DataTableDateTimeFormatPipe, DateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { SecondsToTimePipe } from './pipes/seconds-to-time.pipe';
import { DataTableTopicModelTypeFormatPipe } from './pipes/topic-model-type.pipe';
import { DataTableLogicalCorpusValidForFormatPipe } from './pipes/logical-corpus-valid-for.pipe';

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
		DataTableLogicalCorpusValidForFormatPipe,
		SecondsToTimePipe
	],
	exports: [
		DateFormatPipe,
		DateTimeFormatPipe,
		DataTableDateFormatPipe,
		DataTableDateTimeFormatPipe,
		DataTableTopicModelTypeFormatPipe,
		DataTableLogicalCorpusValidForFormatPipe,
		SecondsToTimePipe
	],
	providers: [
		DateFormatPipe,
		DateTimeFormatPipe,
		DataTableDateFormatPipe,
		DataTableDateTimeFormatPipe,
		DataTableTopicModelTypeFormatPipe,
		DataTableLogicalCorpusValidForFormatPipe,
		SecondsToTimePipe
	]
})
export class CommonFormattingModule { }
