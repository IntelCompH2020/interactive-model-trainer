import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DomainModelsListingComponent } from './domain-models-listing/domain-models-listing.component';
import { ModelsComponent } from './models.component';
import { TopicModelsListingComponent } from './topic-models-listing/topic-models-listing.component';

const routes: Routes = [
	{
		path: '',
		component: ModelsComponent,
		children: [
			{ path: '', redirectTo: 'topic', pathMatch: 'full' },
			{ path: 'domain', component: DomainModelsListingComponent },
			{ path: 'topic', component: TopicModelsListingComponent },
		]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ModelsRoutingModule { }
