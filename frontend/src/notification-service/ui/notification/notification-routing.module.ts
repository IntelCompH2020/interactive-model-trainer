import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { NotificationListingComponent } from '@notification-service/ui/notification/listing/notification-listing.component';

const routes: Routes = [
	{
		path: '',
		component: NotificationListingComponent,
		data: {
			authContext: {
				notificationServicePermissions: [NotificationServicePermission.BrowseNotification]
			}
		},
		canActivate: [AuthGuard]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NotificationRoutingModule { }
