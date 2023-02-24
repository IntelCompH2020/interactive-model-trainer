import { Guid } from '@common/types/guid';
import { ContactInfoType } from '@notification-service/core/enum/contact-info-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';

export interface NotificationServiceUser {
	id: Guid;
	isActive?: IsActive;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
	contacts: NotificationServiceContactInfo[];
	profile: NotificationServiceUserProfile;
}

export interface NotificationServiceContactInfo {
	id: Guid;
	user: NotificationServiceUser;
	type?: ContactInfoType;
	isActive?: IsActive;
	value: string;
	ordinal: number;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
}

export interface NotificationServiceUserProfile {
	id: Guid;
	timezone: string;
	culture?: string;
	language: string;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
	users: NotificationServiceUser[];
}
