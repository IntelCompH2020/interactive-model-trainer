import { Serializable } from '@common/types/json/serializable';
import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { UserSettingsInformation, UserSettingsLookupBuilder } from '@user-service/core/model/user-settings.model';
import { nameof } from 'ts-simple-nameof';

import { Tenant } from '@app/core/model/tenant/tenant.model';
import { TenantLookup } from '@app/core/query/tenant.lookup';

export class TenantListingUserSettings implements Serializable<TenantListingUserSettings>, UserSettingsLookupBuilder<TenantLookup> {

	private like: string;
	private isActive: IsActive[] = [IsActive.Active];
	private order: Lookup.Ordering = { items: [nameof<Tenant>(x => x.name)] };
	private project: Lookup.FieldDirectives = {
		fields: [
			nameof<Tenant>(x => x.id),
			nameof<Tenant>(x => x.code),
			nameof<Tenant>(x => x.name)
		]
	};

	static getUserSettingsInformation(): UserSettingsInformation<TenantListingUserSettings> {
		return {
			key: 'TenantListingUserSettings',
			type: TenantListingUserSettings
		};
	}

	public fromJSONObject(item: any): TenantListingUserSettings {
		this.like = item.like;
		this.isActive = item.isActive;
		this.order = item.order;
		this.project = item.project;
		return this;
	}

	public update(lookup: TenantLookup) {
		this.like = lookup.like;
		this.isActive = lookup.isActive;
		this.order = lookup.order;
		this.project = lookup.project;
	}

	public apply(lookup: TenantLookup): TenantLookup {
		lookup.like = this.like;
		lookup.isActive = this.isActive;
		lookup.order = this.order;
		lookup.project = this.project;
		return lookup;
	}
}
