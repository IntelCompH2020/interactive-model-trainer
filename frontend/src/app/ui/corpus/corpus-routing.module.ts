import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorpusComponent } from './corpus.component';
import { LogicalCorpusListingComponent } from './logical-corpus-listing/logical-corpus-listing.component';
import { RawCorpusListingComponent } from './raw-corpus-listing/raw-corpus-listing.component';

const routes: Routes = [
	{
		path: '',
		component: CorpusComponent,
		children:[
			{ path: '', redirectTo: 'raw', pathMatch: 'full' },
			{ path: 'raw', component: RawCorpusListingComponent },
      		{ path: 'logical', component: LogicalCorpusListingComponent },
		]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CorpusRoutingModule { }
