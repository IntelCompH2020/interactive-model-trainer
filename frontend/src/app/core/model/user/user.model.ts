import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';


export interface User extends BaseEntity {
	firstName: string;
	lastName: string;
	timezone: string;
	language: string;
	subjectId: string;
}
