import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WordListsComponent } from './wordlists.component';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { StopwordsAndEquivalencesComponent } from './stopwords-and-equivalences/stopwords-and-equivalences.component';

const routes: Routes = [
	{
		path: '',
		component: WordListsComponent,
		children: [
			{ path: '', redirectTo: 'stopwords', pathMatch: 'full' },
			{ path: 'keywords', component: KeywordsListingComponent },
			{ path: 'stopwords', component: StopwordsAndEquivalencesComponent, data: { wordlistView: 'stopwords' } },
			{ path: 'equivalences', component: StopwordsAndEquivalencesComponent, data: { wordlistView: 'equivalences' } },
		]
	},
	{ path: '**', loadChildren: () => import('@common/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class WordListsRoutingModule { }
