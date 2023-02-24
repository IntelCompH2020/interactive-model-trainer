import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';

export interface Tenant extends BaseEntity {
	name: string;
	code: string;
	config: string;
}


export interface TenantPersist extends BaseEntityPersist {
	name: string;
	code: string;
	config: string;
}
