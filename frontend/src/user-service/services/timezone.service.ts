import { Injectable } from '@angular/core';
import * as moment from 'moment';
import 'moment-timezone';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class TimezoneService {

	private timezoneValues: string[];
	private timezoneChangeSubject = new Subject<string>();
	private currentTimezone: string;

	constructor() {
		this.timezoneValues = moment.tz.names();
	}

	getTimezoneValues(): string[] {
		return this.timezoneValues;
	}

	hasTimezoneValue(timezone: string): boolean {
		return this.timezoneValues.includes(timezone);
	}

	timezoneSelected(timezone: string) {
		if (this.currentTimezone === timezone) { return; }
		this.currentTimezone = timezone;
		this.timezoneChangeSubject.next(timezone);
	}

	getTimezoneChangeObservable(): Observable<string> {
		return this.timezoneChangeSubject.asObservable();
	}

	getCurrentTimezone(): string {
		return this.currentTimezone;
	}
}
