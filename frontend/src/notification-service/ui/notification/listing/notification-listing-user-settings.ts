import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationNotifyState } from '@notification-service/core/enum/notification-notify-state.enum';
import { NotificationTrackingProcess } from '@notification-service/core/enum/notification-tracking-process.enum';
import { NotificationTrackingState } from '@notification-service/core/enum/notification-tracking-state.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { Notification } from '@notification-service/core/model/notification.model';
import { NotificationLookup } from '@notification-service/core/query/notification.lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';

export class NotificationListingUserSettings implements Serializable<NotificationListingUserSettings>, UserSettingsLookupBuilder<NotificationLookup> {

	isActive: IsActive[] = [IsActive.Active];
	state: NotificationNotifyState[];
	trackingState: NotificationTrackingState[];
	trackingProcess: NotificationTrackingProcess[];
	type: NotificationType[];
	contactType: ContactType[];
	provenanceType: NotificationType[];
	provenanceRef: string[];
	userIds: Guid[];
	order: Lookup.Ordering = { items: [nameof<Notification>(x => x.createdAt)] };
	project: Lookup.FieldDirectives = {
		fields: [
			nameof<Notification>(x => x.id),
			nameof<Notification>(x => x.isActive),
			nameof<Notification>(x => x.type),
			nameof<Notification>(x => x.contactType),
			nameof<Notification>(x => x.notifyState),
			nameof<Notification>(x => x.notifiedAt),
			nameof<Notification>(x => x.trackingState),
			nameof<Notification>(x => x.trackingProcess),
			nameof<Notification>(x => x.provenanceType),
			nameof<Notification>(x => x.createdAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<NotificationListingUserSettings> {
		return {
			key: 'NotificationListingUserSettings',
			type: NotificationListingUserSettings
		};
	}

	public fromJSONObject(item: any): NotificationListingUserSettings {
		this.state = item.state;
		this.trackingState = item.trackingState;
		this.trackingProcess = item.trackingProcess;
		this.type = item.type;
		this.contactType = item.contactType;
		this.provenanceType = item.provenanceType;
		this.provenanceRef = item.provenanceRef;
		this.userIds = item.userIds;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	update(lookup: NotificationLookup) {
		this.state = lookup.state;
		this.trackingState = lookup.trackingState;
		this.trackingProcess = lookup.trackingProcess;
		this.type = lookup.type;
		this.contactType = lookup.contactType;
		this.provenanceType = lookup.provenanceType;
		this.provenanceRef = lookup.provenanceRef;
		this.userIds = lookup.userIds;
		this.isActive = lookup.isActive;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	apply(lookup: NotificationLookup): NotificationLookup {
		lookup.state = this.state;
		lookup.trackingState = this.trackingState;
		lookup.trackingProcess = this.trackingProcess;
		lookup.type = this.type;
		lookup.contactType = this.contactType;
		lookup.provenanceType = this.provenanceType;
		lookup.provenanceRef = this.provenanceRef;
		lookup.userIds = this.userIds;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
