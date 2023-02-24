import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';
import { TenantEditorComponent } from './editor/tenant-editor.component';
import { TenantEditorResolver } from './editor/tenant-editor.resolver';
import { TenantListingComponent } from './listing/tenant-listing.component';

const routes: Routes = [
	{
		path: '',
		component: TenantListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				permissions: [AppPermission.EditTenant]
			}
		},
		component: TenantEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: TenantEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': TenantEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [TenantEditorResolver]
})
export class TenantRoutingModule { }
