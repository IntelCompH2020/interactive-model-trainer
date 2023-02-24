import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';

export class UserNotificationPreferenceLookup extends Lookup implements UserNotificationPreferenceFilter {
	userIds?: Guid[];
	type?: NotificationType[];
	channel?: ContactType[];

	constructor() {
		super();
	}
}

export interface UserNotificationPreferenceFilter {
	userIds?: Guid[];
	type?: NotificationType[];
	channel?: ContactType[];
}
