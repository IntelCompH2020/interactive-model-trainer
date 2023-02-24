import { Guid } from '@common/types/guid';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';
import { NotificationServiceUser } from '@notification-service/core/model/user.model';

export interface InAppNotification {
	id: Guid;
	user: NotificationServiceUser;
	isActive: IsActive;
	type: Guid;
	trackingState: NotificationInAppTracking;
	subject: string;
	body: string;
	createdAt: Date;
	updatedAt: Date;
	hash: string;
}
