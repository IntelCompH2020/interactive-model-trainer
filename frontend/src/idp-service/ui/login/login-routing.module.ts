import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@idp-service/ui/login/login.component';
import { PostLoginComponent } from './post-login/post-login.component';

const routes: Routes = [
	{
		path: '',
		component: LoginComponent
	},
	{
		path: 'post',
		component: PostLoginComponent
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LoginRoutingModule { }
