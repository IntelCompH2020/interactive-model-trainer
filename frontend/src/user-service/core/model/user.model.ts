import { BaseEntity } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';
import { ContactInfoType } from '@notification-service/core/enum/contact-info-type.enum';

export interface UserServiceUser extends BaseEntity {
	name: string;
	profile: UserServiceUserProfile;
	contacts: UserServiceUserContactInfo[];
}

export interface UserServiceUserPersist {
	id?: Guid;
	name: string;
	hash: string;
	profile?: UserServiceUserProfilePersist;
	contacts?: UserServiceUserContactInfoPersist[];
}

export interface UserServiceUserProfile {
	id?: Guid;
	timezone: string;
	culture: string;
	language: string;
	profilePictureRef: string;
	profilePictureUrl: string;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
	users: UserServiceUser[];
}

export interface UserServiceUserProfilePersist {
	id?: Guid;
	timezone: string;
	culture: string;
	language: string;
	profilePicture: string;
	hash: string;
}

export interface ProfilePictureUploadModel {
	file: any;
}

export interface UserProfileLanguagePatch {
	id?: Guid;
	language: string;
}

export interface UserServiceUserContactInfo {
	user: UserServiceUser;
	type: ContactInfoType;
	value: string;
	createdAt?: Date;
}

export interface UserServiceUserContactInfoPersist {
	userId?: Guid;
	type: ContactInfoType;
	value: string;
}

export interface UserContactInfoPatch {
	id?: Guid;
	hash: string;
	contacts: UserServiceUserContactInfoPersist[];
}

export interface UserServiceNamePatch {
	id?: Guid;
	name: string;
}
