import { Pipe, PipeTransform } from '@angular/core';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';

@Pipe({ name: 'IsActiveTypeFormat' })
export class IsActiveTypePipe implements PipeTransform {
	constructor(private enumUtils: IdpServiceEnumUtils) { }

	public transform(value): any {
		return this.enumUtils.toIsActiveString(value);
	}
}
