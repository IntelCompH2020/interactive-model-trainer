import { Pipe, PipeTransform } from '@angular/core';
import { CultureInfo } from '@user-service/services/culture.service';

@Pipe({ name: 'cultureInfoDisplay' })
export class CultureInfoDisplayPipe implements PipeTransform {
	constructor() { }

	public transform(value: CultureInfo): any {
		return value.nativeName + ' [' + value.name + ']';
	}
}
