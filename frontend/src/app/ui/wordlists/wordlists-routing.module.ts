import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WordListsComponent } from './wordlists.component';
import { StopwordsListingComponent } from './stopwords-and-equivalencies/stopwords-listing/stopwords-listing.component';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { StopwordsAndEquivalenciesComponent } from './stopwords-and-equivalencies/stopwords-and-equivalencies.component';

const routes: Routes = [
	{
		path: '',
		component: WordListsComponent,
		children:[
			{ path: '', redirectTo: 'stopwords', pathMatch: 'full' },
			{ path: 'keywords', component: KeywordsListingComponent },
      		{ path: 'stopwords', component: StopwordsAndEquivalenciesComponent },
		]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class WordListsRoutingModule { }
