import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TimezoneService } from '@user-service/services/timezone.service';
import * as moment from 'moment-timezone';

@Pipe({
	name: 'dateTimeFormatter'
})
export class DateTimeFormatPipe implements PipeTransform {

	constructor(private datePipe: DatePipe, private timezoneService: TimezoneService) {

	}

	transform(value: any, format?: string, timezone?: string, locale?: string): string | null {
		const timezoneToUse = timezone ? timezone : moment.tz.guess();
		return this.datePipe.transform(moment.utc(value).toDate(), format, timezoneToUse, locale);
	}
}


@Pipe({
	name: 'dataTableDateTimeFormatter'
})
// This is only used for the DataTable Column definition.
// It's a hacky way to apply format to the pipe because it only supports passing a pipe instance and calls transform in it without params.
export class DataTableDateTimeFormatPipe extends DateTimeFormatPipe implements PipeTransform {

	format: string;

	constructor(private _datePipe: DatePipe, private _timezoneService: TimezoneService) {
		super(_datePipe, _timezoneService);
	}

	public withFormat(format: string): DataTableDateTimeFormatPipe {
		this.format = format;
		return this;
	}

	transform(value: any): string | null {
		return super.transform(value, this.format);
	}
}

