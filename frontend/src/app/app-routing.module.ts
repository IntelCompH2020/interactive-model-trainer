import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';

const appRoutes: Routes = [

	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		loadChildren: () => import('@app/ui/home/home.module').then(m => m.HomeModule)
	},
	{
		path: 'corpus',
		canActivate: [AuthGuard],
		loadChildren: () => import('@app/ui/corpus/corpus.module').then(m => m.CorpusModule)
	},
	{
		path: 'models',
		canActivate: [AuthGuard],
		loadChildren: () => import('@app/ui/models/models.module').then(m => m.ModelsModule)
	},
	{
		path: 'wordlists',
		canActivate: [AuthGuard],
		loadChildren: () => import('@app/ui/wordlists/wordlists.module').then(m => m.WordListsModule)
	},
	{
		path: 'login',
		loadChildren: () => import('@idp-service/ui/login/login.module').then(m => m.LoginModule)
	},
	{
		path: 'notifications',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewNotificationPage]
			}
		},
		loadChildren: () => import('@notification-service/ui/notification/notification.module').then(m => m.NotificationModule)
	},
	{
		path: 'inapp-notifications',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.ViewInAppNotificationPage]
			},
			breadcrumb: {
				languageKey: 'APP.NAVIGATION.INAPP-NOTIFICATIONS',
				permissions: [AppPermission.ViewInAppNotificationPage],
			}
		},
		loadChildren: () => import('@notification-service/ui/inapp-notification/inapp-notification.module').then(m => m.InAppNotificationModule)
	},
	{ path: 'logout', loadChildren: () => import('@idp-service/ui/logout/logout.module').then(m => m.LogoutModule) },
	{ path: 'unauthorized', loadChildren: () => import('@common/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule) },
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule],
})
export class AppRoutingModule { }
