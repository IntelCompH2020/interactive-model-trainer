import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { TenantConfigurationType } from '@notification-service/core/enum/tenant-configuration-type.enum';

export class TenantConfigurationLookup extends Lookup implements TenantConfigurationFilter {
	ids?: Guid[];
	excludedIds?: Guid[];
	isActive?: IsActive[];
	type?: TenantConfigurationType[];

	constructor() {
		super();
	}
}

export interface TenantConfigurationFilter {
	ids?: Guid[];
	excludedIds?: Guid[];
	isActive?: IsActive[];
	type?: TenantConfigurationType[];
}
