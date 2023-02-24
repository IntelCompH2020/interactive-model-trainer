import { Injectable } from '@angular/core';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';

@Injectable()
export class UserServiceEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toContactTypeString(value: ContactType): string {
		switch (value) {
			case ContactType.Email: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.EMAIL');
			case ContactType.SlackBroadcast: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.SLACK-BROADCAST');
			case ContactType.Sms: return this.language.instant('USER-SERVICE.TYPES.CONTACT-TYPE.SMS');
			default: return '';
		}
	}
}
