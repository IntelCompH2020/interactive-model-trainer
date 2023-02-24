import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';

export interface UserNotificationPreference {
	userId?: Guid;
	type: NotificationType;
	channel: ContactType;
	ordinal: number;
	createdAt?: Date;
}

export interface UserNotificationPreferencePersist {
	userId?: Guid;
	notificationPreferences: { [key: string]: ContactType[] };
}
