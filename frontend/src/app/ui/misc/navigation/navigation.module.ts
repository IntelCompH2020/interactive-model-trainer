import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from '@app/ui/misc/navigation/navigation.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { InAppNotificationModule } from '@notification-service/ui/inapp-notification/inapp-notification.module';

@NgModule({
	imports: [
		CommonUiModule,
		RouterModule,
		InAppNotificationModule,
		MatBadgeModule,
	],
	declarations: [
		NavigationComponent
	],
	exports: [NavigationComponent]
})
export class NavigationModule { }
