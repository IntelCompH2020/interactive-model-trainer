import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationNotifyState } from '@notification-service/core/enum/notification-notify-state.enum';
import { NotificationTrackingProcess } from '@notification-service/core/enum/notification-tracking-process.enum';
import { NotificationTrackingState } from '@notification-service/core/enum/notification-tracking-state.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';

export class NotificationLookup extends Lookup implements NotificationFilter {
	ids: Guid[];
	isActive: IsActive[];
	state: NotificationNotifyState[];
	trackingState: NotificationTrackingState[];
	trackingProcess: NotificationTrackingProcess[];
	type: NotificationType[];
	contactType: ContactType[];
	provenanceType: NotificationType[];
	provenanceRef: string[];
	userIds: Guid[];

	constructor() {
		super();
	}
}

export interface NotificationFilter {
	ids: Guid[];
	isActive: IsActive[];
	state: NotificationNotifyState[];
	trackingState: NotificationTrackingState[];
	trackingProcess: NotificationTrackingProcess[];
	type: NotificationType[];
	contactType: ContactType[];
	provenanceType: NotificationType[];
	provenanceRef: string[];
	userIds: Guid[];
}
