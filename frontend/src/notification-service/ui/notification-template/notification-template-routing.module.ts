import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { NotificationTemplateListingComponent } from '@notification-service/ui/notification-template/listing/notification-template-listing.component';

const routes: Routes = [
	{
		path: '',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				notificationServicePermissions: [NotificationServicePermission.EditNotificationTemplate]
			}
		},
		component: NotificationTemplateListingComponent
	},
	{
		path: ':notification-type/:channel/:language',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				notificationServicePermissions: [NotificationServicePermission.EditNotificationTemplate]
			}
		},
		component: NotificationTemplateListingComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NotificationTemplateRoutingModule { }
