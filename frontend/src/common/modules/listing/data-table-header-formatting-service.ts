import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { DataTableDateFormatPipe } from '@common/formatting/pipes/date-format.pipe';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { TimezoneService } from '@user-service/services/timezone.service';

@Injectable()
export class DataTableHeaderFormattingService {

	constructor(private datePipe: DatePipe, private timezoneService: TimezoneService) {

	}

	getDataTableDateTimeFormatPipe(format?: string): DataTableDateTimeFormatPipe {
		return new DataTableDateTimeFormatPipe(this.datePipe, this.timezoneService).withFormat(format);
	}

	getDataTableDateFormatPipe(format?: string): DataTableDateFormatPipe {
		return new DataTableDateFormatPipe(this.datePipe).withFormat(format);
	}
}
