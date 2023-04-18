import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordListsComponent } from './wordlists.component';
import { WordListsRoutingModule } from './wordlists-routing.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NewKeywordFromFileComponent } from './keywords/new-keyword-from-file/new-keyword-from-file.component';
import { StopwordsListingComponent } from './stopwords-and-equivalences/stopwords-listing/stopwords-listing.component';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { NewKeywordManuallyComponent } from './keywords/new-keyword-manually/new-keyword-manually.component';
import { StopwordsAndEquivalencesComponent } from './stopwords-and-equivalences/stopwords-and-equivalences.component';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { NewStopwordManuallyComponent } from './stopwords-and-equivalences/stopwords-listing/new-stopword-manually/new-stopword-manually.component';
import { NewStopwordFromFileComponent } from './stopwords-and-equivalences/stopwords-listing/new-stopword-from-file/new-stopword-from-file.component';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { EquivalencesListingComponent } from './stopwords-and-equivalences/equivalences-listing/equivalences-listing.component';
import { NewEquivalenceFromFileComponent } from './stopwords-and-equivalences/equivalences-listing/new-equivalence-from-file/new-equivalence-from-file.component';
import { NewEquivalenceManuallyComponent } from './stopwords-and-equivalences/equivalences-listing/new-equivalence-manually/new-equivalence-manually.component';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { WordlistDetailsComponent } from './wordlist-details/wordlist-details.component';
import { RenameDialogModule } from '../rename-dialog/rename-dialog.module';
import { MergeWordlistsDialogComponent } from './merge-wordlists-dialog/merge-wordlists-dialog.component';

@NgModule({
  declarations: [
    WordListsComponent,
    KeywordsListingComponent,
    NewKeywordFromFileComponent,
    NewKeywordManuallyComponent,
    StopwordsListingComponent,
    StopwordsAndEquivalencesComponent,
    NewStopwordManuallyComponent,
    NewStopwordFromFileComponent,
    EquivalencesListingComponent,
    NewEquivalenceFromFileComponent,
    NewEquivalenceManuallyComponent,
    WordlistDetailsComponent,
    MergeWordlistsDialogComponent
  ],
  imports: [
    CommonModule,
    ListingModule,
    CommonUiModule,
    WordListsRoutingModule,
    CommonFormsModule,
    RenameDialogModule
  ],
  providers:[
    KeywordService,
    StopwordService,
    EquivalenceService
  ]
})
export class WordListsModule { }
