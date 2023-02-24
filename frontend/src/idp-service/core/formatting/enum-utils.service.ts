import { Injectable } from '@angular/core';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class IdpServiceEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('IDP-SERVICE.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('IDP-SERVICE.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}
}
