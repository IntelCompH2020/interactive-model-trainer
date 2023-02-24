import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth-guard.service';
import { AppPermission } from '@app/core/enum/permission.enum';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';
import { UserEditorComponent } from '@user-service/ui/users/editor/user-editor.component';
import { UserEditorResolver } from '@user-service/ui/users/editor/user-editor.resolver';
import { UserListingComponent } from '@user-service/ui/users/listing/user-listing.component';

const routes: Routes = [
	{
		path: '',
		component: UserListingComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'new',
		canActivate: [AuthGuard],
		data: {
			authContext: {
				// userServicePermissions: [AppPermission.EditUserPerson]
			}
		},
		component: UserEditorComponent,
		canDeactivate: [PendingChangesGuard],
	},
	{
		path: ':id',
		canActivate: [AuthGuard],
		component: UserEditorComponent,
		canDeactivate: [PendingChangesGuard],
		resolve: {
			'entity': UserEditorResolver
		}
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [UserEditorResolver]
})
export class UserRoutingModule { }
