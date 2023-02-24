import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { TenantConfigurationType } from '@notification-service/core/enum/tenant-configuration-type.enum';

export interface TenantConfiguration {
	id?: Guid;
	type: TenantConfigurationType;
	value: string;
	slackBroadcastData: SlackBroadcastDataContainer;
	emailClientData: EmailClientConfigurationDataContainer;
	smsClientData: SmsClientConfigurationDataContainer;
	notifierListData: NotifierListConfigurationDataContainer;
	createdAt?: Date;
	updatedAt?: Date;
	hash: string;
}

//
// Slack Broadcast
//
export interface SlackBroadcastDataContainer {
	webhooks: SlackBroadcastWebhookInfo[];
}

export interface TenantConfigurationSlackBroadcastPersist {
	id?: Guid;
	hash?: string;
	webhooks: SlackBroadcastWebhookInfo[];
}

export interface SlackBroadcastWebhookInfo {
	id: Guid;
	name: string;
	webhook: string;
}

//
// Email Client Configuration
//
export interface EmailClientConfigurationDataContainer {
	requiresCredentials: boolean;
	enableSSL: boolean;
	hostServer: string;
	hostPortNo: number;
	emailAddress: string;
	emailUsername: string;
	emailPassword: string;
}

export interface TenantConfigurationEmailClientPersist {
	id?: Guid;
	hash?: string;
	requiresCredentials: boolean;
	enableSSL: boolean;
	hostServer: string;
	hostPortNo: number;
	emailAddress: string;
	emailUsername: string;
	emailPassword: string;
}

//
// Sms Client
//
export interface SmsClientConfigurationDataContainer {
	applicationId: string;
	applicationSecret: string;
	sendAsName: string;
}

export interface TenantConfigurationSmsClientPersist {
	id?: Guid;
	hash?: string;
	applicationId: string;
	applicationSecret: string;
	sendAsName: string;
}

//
// Notifier List
//
export interface NotifierListConfigurationDataContainer {
	notifiers: { [key: string]: ContactType[] };
}

export interface TenantConfigurationNotifierListPersist {
	id?: Guid;
	hash?: string;
	notifiers: { [key: string]: ContactType[] };
}


