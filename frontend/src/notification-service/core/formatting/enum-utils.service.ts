import { Injectable } from '@angular/core';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';
import { NotificationNotifyState } from '@notification-service/core/enum/notification-notify-state.enum';
import { NotificationTemplateChannel } from '@notification-service/core/enum/notification-template-channel.enum';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationTrackingProcess } from '@notification-service/core/enum/notification-tracking-process.enum';
import { NotificationTrackingState } from '@notification-service/core/enum/notification-tracking-state.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';

@Injectable()
export class NotificationServiceEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }


	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('NOTIFICATION-SERVICE.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('NOTIFICATION-SERVICE.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}

	public toNotificationTypeString(value: NotificationType): string {
		switch (value) {
			case NotificationType.RegistrationInvitation: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.REGISTRATION-INVITATION');
			case NotificationType.TotpOverrideUsed: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.TOTP-OVERRIDE-USED');
			case NotificationType.CredentialReset: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.CREDENTIAL-RESET');
			case NotificationType.DirectLink: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.DIRECT-LINK');
			case NotificationType.ForgetMeRequest: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.FORGET-ME-REQUEST');
			case NotificationType.WhatYouKnowAboutMeRequest: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST');
			case NotificationType.WhatYouKnowAboutMeRequestCompleted: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.WHAT-YOU-KNOW-ABOUT-ME-REQUEST-COMPLETED');
			case NotificationType.EmailResetRequest: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.EMAIL-RESET-REQUEST');
			case NotificationType.EmailResetAwareness: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.EMAIL-RESET-AWARENESS');
			case NotificationType.EmailResetRemove: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.EMAIL-RESET-REMOVE');
			case NotificationType.GenerateFileCompleted: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TYPE.GENERATE-FILE-COMPLETED');
			default: return '';
		}
	}

	public toContactTypeString(value: ContactType): string {
		switch (value) {
			case ContactType.Email: return this.language.instant('NOTIFICATION-SERVICE.TYPES.CONTACT-TYPE.EMAIL');
			case ContactType.SlackBroadcast: return this.language.instant('NOTIFICATION-SERVICE.TYPES.CONTACT-TYPE.SLACK-BROADCAST');
			case ContactType.Sms: return this.language.instant('NOTIFICATION-SERVICE.TYPES.CONTACT-TYPE.SMS');
			case ContactType.InApp: return this.language.instant('NOTIFICATION-SERVICE.TYPES.CONTACT-TYPE.IN-APP');
			default: return '';
		}
	}

	public toNotificationNotifyStateString(value: NotificationNotifyState): string {
		switch (value) {
			case NotificationNotifyState.Pending: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-NOTIFY-STATE.PENDING');
			case NotificationNotifyState.Processing: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-NOTIFY-STATE.PROCESSING');
			case NotificationNotifyState.Successful: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-NOTIFY-STATE.SUCCESSFUL');
			case NotificationNotifyState.Error: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-NOTIFY-STATE.ERROR');
			case NotificationNotifyState.Omitted: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-NOTIFY-STATE.OMITTED');
			default: return '';
		}
	}

	public toNotificationTrackingStateString(value: NotificationTrackingState): string {
		switch (value) {
			case NotificationTrackingState.Undefined: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.UNDEFINED');
			case NotificationTrackingState.NA: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.NA');
			case NotificationTrackingState.Queued: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.QUEUED');
			case NotificationTrackingState.Sent: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.SENT');
			case NotificationTrackingState.Delivered: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.DELIVERED');
			case NotificationTrackingState.Undelivered: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.UNDELIVERED');
			case NotificationTrackingState.Failed: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.FAILED');
			case NotificationTrackingState.Unsent: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-STATE.UNSENT');
			default: return '';
		}
	}

	public toNotificationTrackingProcessString(value: NotificationTrackingProcess): string {
		switch (value) {
			case NotificationTrackingProcess.Pending: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-PROCESS.PENDING');
			case NotificationTrackingProcess.Processing: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-PROCESS.PROCESSING');
			case NotificationTrackingProcess.Completed: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-PROCESS.COMPLETED');
			case NotificationTrackingProcess.Error: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-PROCESS.ERROR');
			case NotificationTrackingProcess.Omitted: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TRACKING-PROCESS.OMITTED');
			default: return '';
		}
	}

	public toNotificationInAppTrackingString(value: NotificationInAppTracking): string {
		switch (value) {
			case NotificationInAppTracking.Delivered: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-INAPP-TRACKING.DELIVERED');
			case NotificationInAppTracking.Stored: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-INAPP-TRACKING.STORED');
			default: return '';
		}
	}

	public toNotificationChannelString(value: NotificationTemplateChannel): string {
		switch (value) {
			case NotificationTemplateChannel.Email: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-CHANNEL.EMAIL');
			case NotificationTemplateChannel.SlackBroadcast: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-CHANNEL.SLACK-BROADCAST');
			case NotificationTemplateChannel.Sms: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-CHANNEL.SMS');
			case NotificationTemplateChannel.InApp: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-CHANNEL.IN-APP');
			default: return '';
		}
	}

	public toNotificationTemplateKindString(value: NotificationTemplateKind): string {
		switch (value) {
			case NotificationTemplateKind.Default: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-KIND.DEFAULT');
			case NotificationTemplateKind.Primary: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-KIND.PRIMARY');
			case NotificationTemplateKind.Secondary: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-KIND.SECONDARY');
			case NotificationTemplateKind.Draft: return this.language.instant('NOTIFICATION-SERVICE.TYPES.NOTIFICATION-TEMPLATE-KIND.DRAFT');
			default: return '';
		}
	}
}
