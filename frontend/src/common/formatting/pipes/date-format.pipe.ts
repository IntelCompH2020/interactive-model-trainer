import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment-timezone';

@Pipe({
	name: 'dateFormatter'
})
export class DateFormatPipe implements PipeTransform {

	constructor(private datePipe: DatePipe) {

	}

	transform(value: any, format?: string, locale?: string): string | null {
		// using timezone set in timezoneService by default. can be overwritten with pipe arguments
		const timezoneToUse = moment(value).tz('UTC').format('Z');
		return this.datePipe.transform(value, format, timezoneToUse, locale);
	}
}

@Pipe({
	name: 'dataTableDateFormatter'
})
// This is only used for the DataTable Column definition.
// It's a hacky way to apply format to the pipe because it only supports passing a pipe instance and calls transform in it without params.
export class DataTableDateFormatPipe extends DateFormatPipe implements PipeTransform {

	format: string;

	constructor(_datePipe: DatePipe) {
		super(_datePipe);
	}

	public withFormat(format: string): DataTableDateFormatPipe {
		this.format = format;
		return this;
	}

	transform(value: any): string | null {
		return super.transform(value, this.format);
	}
}
