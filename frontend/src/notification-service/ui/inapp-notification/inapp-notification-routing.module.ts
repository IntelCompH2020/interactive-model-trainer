import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { InAppNotificationEditorComponent } from '@notification-service/ui/inapp-notification/editor/inapp-notification-editor.component';
import { InAppNotificationListingComponent } from '@notification-service/ui/inapp-notification/listing/inapp-notification-listing.component';

const routes: Routes = [
	{
		path: '',
		component: InAppNotificationListingComponent,
		data: {
		},
		canActivate: [AuthGuard]
	},
	{
		path: 'dialog/:id',
		canActivate: [AuthGuard],
		data: {
			isFromDialog: true,
		},
		component: InAppNotificationEditorComponent
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: InAppNotificationEditorComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InAppNotificationRoutingModule { }
