import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationNotifyState } from '@notification-service/core/enum/notification-notify-state.enum';
import { NotificationTrackingProcess } from '@notification-service/core/enum/notification-tracking-process.enum';
import { NotificationTrackingState } from '@notification-service/core/enum/notification-tracking-state.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationServiceUser } from '@notification-service/core/model/user.model';

export interface Notification {
	id: Guid;
	user: NotificationServiceUser;
	isActive: IsActive;
	type: NotificationType;
	contactType: ContactType;
	contactHint: string;
	data: string;
	notifyState: NotificationNotifyState;
	notifiedWith: ContactType;
	notifiedAt: Date;
	retryCount: number;
	trackingState: NotificationTrackingState;
	trackingProcess: NotificationTrackingProcess;
	trackingData: string;
	provenanceType: NotificationType;
	provenanceRef: string;
	createdAt: Date;
	updatedAt: Date;
	hash: string;
}
