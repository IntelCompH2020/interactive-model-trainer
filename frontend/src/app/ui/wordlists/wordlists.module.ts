import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordListsComponent } from './wordlists.component';
import { WordListsRoutingModule } from './wordlists-routing.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NewKeywordFromFileComponent } from './keywords/new-keyword-from-file/new-keyword-from-file.component';
import { StopwordsListingComponent } from './stopwords-and-equivalencies/stopwords-listing/stopwords-listing.component';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { NewKeywordManuallyComponent } from './keywords/new-keyword-manually/new-keyword-manually.component';
import { StopwordsAndEquivalenciesComponent } from './stopwords-and-equivalencies/stopwords-and-equivalencies.component';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { NewStopwordManuallyComponent } from './stopwords-and-equivalencies/stopwords-listing/new-stopword-manually/new-stopword-manually.component';
import { NewStopwordFromFileComponent } from './stopwords-and-equivalencies/stopwords-listing/new-stopword-from-file/new-stopword-from-file.component';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { EquivalenciesListingComponent } from './stopwords-and-equivalencies/equivalencies-listing/equivalencies-listing.component';
import { NewEquivalenceFromFileComponent } from './stopwords-and-equivalencies/equivalencies-listing/new-equivalence-from-file/new-equivalence-from-file.component';
import { NewEquivalenceManuallyComponent } from './stopwords-and-equivalencies/equivalencies-listing/new-equivalence-manually/new-equivalence-manually.component';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { RenameKeywordComponent } from './keywords/rename-keyword/rename-keyword.component';
import { RenameStopwordComponent } from './stopwords-and-equivalencies/stopwords-listing/rename-stopword/rename-stopword.component';
import { RenameEquivalenceComponent } from './stopwords-and-equivalencies/equivalencies-listing/rename-equivalence/rename-equivalence.component';

@NgModule({
  declarations: [
    WordListsComponent,
    KeywordsListingComponent,
    NewKeywordFromFileComponent,
    NewKeywordManuallyComponent,
    RenameKeywordComponent,
    StopwordsListingComponent,
    StopwordsAndEquivalenciesComponent,
    NewStopwordManuallyComponent,
    NewStopwordFromFileComponent,
    RenameStopwordComponent,
    EquivalenciesListingComponent,
    NewEquivalenceFromFileComponent,
    NewEquivalenceManuallyComponent,
    RenameEquivalenceComponent
  ],
  imports: [
    CommonModule,
    ListingModule,
    CommonUiModule,
    WordListsRoutingModule,
    CommonFormsModule
  ],
  providers:[
    KeywordService,
    StopwordService,
    EquivalenceService
  ]
})
export class WordListsModule { }
