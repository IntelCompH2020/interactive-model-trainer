import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';

export interface BaseEntity {
	id: Guid;
	isActive: IsActive;
	createdAt: Date;
	updatedAt: Date;
	hash: string;
}

export interface BaseEntityPersist {
	id: Guid;
	hash: string;
}
