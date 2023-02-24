import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonFormattingModule } from '@common/formatting/common-formatting.module';
import { PipeService } from '@common/formatting/pipe.service';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { IsActiveTypePipe } from '@notification-service/core/formatting/pipes/is-active-type.pipe';
import { NotificationInAppTrackingTypePipe } from '@notification-service/core/formatting/pipes/notification-inapp-tracking-type.pipe';

//
//
// This is shared module that provides all notification service formatting utils. Its imported only once.
//
//
@NgModule({
	imports: [
		CommonFormattingModule
	],
	declarations: [
		IsActiveTypePipe,
		NotificationInAppTrackingTypePipe
	],
	exports: [
		CommonFormattingModule,
		IsActiveTypePipe,
		NotificationInAppTrackingTypePipe
	],
	providers: [
		NotificationServiceEnumUtils,
		PipeService,
		DatePipe,
		IsActiveTypePipe,
		NotificationInAppTrackingTypePipe
	]
})
export class NotificationServiceFormattingModule { }
