import { Serializable } from '@common/types/json/serializable';
import { Lookup } from '@common/model/lookup';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { InAppNotification } from '@notification-service/core/model/inapp-notification.model';
import { InAppNotificationLookup } from '@notification-service/core/query/inapp-notification.lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';

export class InAppNotificationListingUserSettings implements Serializable<InAppNotificationListingUserSettings>, UserSettingsLookupBuilder<InAppNotificationLookup> {

	private like: string;
	private isActive: IsActive[] = [IsActive.Active];
	private order: Lookup.Ordering = { items: [nameof<InAppNotification>(x => x.createdAt)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<InAppNotification>(x => x.id),
			nameof<InAppNotification>(x => x.subject),
			nameof<InAppNotification>(x => x.trackingState),
			nameof<InAppNotification>(x => x.createdAt)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<InAppNotificationListingUserSettings> {
		return {
			key: 'InAppNotificationListingUserSettings',
			type: InAppNotificationListingUserSettings
		};
	}

	public fromJSONObject(item: any): InAppNotificationListingUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	public update(lookup: InAppNotificationLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	public apply(lookup: InAppNotificationLookup): InAppNotificationLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
