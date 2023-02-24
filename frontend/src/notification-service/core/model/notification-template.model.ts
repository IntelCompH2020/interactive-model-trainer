import { Guid } from '@common/types/guid';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationTemplateChannel } from '@notification-service/core/enum/notification-template-channel.enum';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';

export interface NotificationTemplate {
	id: Guid;
	channel: NotificationTemplateChannel;
	notificationType: NotificationType;
	kind: NotificationTemplateKind;
	language: string;
	description: string;
	value: NotificationTemplateValue;
	isActive: IsActive;
	createdAt: Date;
	updatedAt: Date;
	hash: string;
}

export interface NotificationTemplateValue {
	subjectText: string;
	subjectFieldOptions: NotificationFieldOptions;
	bodyText: string;
	bodyFieldOptions: NotificationFieldOptions;
}

export interface NotificationFieldOptions {
	mandatory?: string[];
	options?: NotificationFieldInfo[];
	formatting?: { [key: string]: string };
}

export interface NotificationFieldInfo {
	key: string;
	value: string;
}

export interface NotificationTemplatePersist {
	id?: Guid;
	channel: NotificationTemplateChannel;
	notificationType: NotificationType;
	kind: NotificationTemplateKind;
	language: string;
	description: string;
	value: NotificationTemplateValue;
	hash?: string;
}
