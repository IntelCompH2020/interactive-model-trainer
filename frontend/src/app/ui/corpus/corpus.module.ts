import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorpusComponent } from './corpus.component';
import { CorpusRoutingModule } from './corpus-routing.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { RawCorpusListingComponent } from './raw-corpus-listing/raw-corpus-listing.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NewRawCorpusComponent } from './raw-corpus-listing/new-raw-corpus/new-raw-corpus.component';
import { NewLogicalCorpusComponent } from './logical-corpus-listing/new-logical-corpus/new-logical-corpus.component';
import { LogicalCorpusListingComponent } from './logical-corpus-listing/logical-corpus-listing.component';
import { RawCorpusService } from '@app/core/services/http/raw-corpus.service';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { MergeLogicalCorpusComponent } from './logical-corpus-listing/new-logical-corpus/merge-logical-corpus/merge-logical-corpus.component';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MergedCorpusTableComponent } from './logical-corpus-listing/new-logical-corpus/merged-corpus-table/merged-corpus-table.component';
import { NewMergedFieldComponent } from './logical-corpus-listing/new-logical-corpus/new-merged-field/new-merged-field.component';
import { NewLogicalCorpusFromFileComponent } from './logical-corpus-listing/new-logical-corpus-from-file/new-logical-corpus-from-file.component';
import { FileModule } from '../file/file.module';
import { RenameDialogModule } from '../rename-dialog/rename-dialog.module';

@NgModule({
  declarations: [
    CorpusComponent,
    RawCorpusListingComponent,
    NewRawCorpusComponent,
    NewLogicalCorpusComponent,
    NewLogicalCorpusFromFileComponent,
    LogicalCorpusListingComponent,
    MergeLogicalCorpusComponent,
    MergedCorpusTableComponent,
    NewMergedFieldComponent
  ],
  imports: [
    CommonModule,
    ListingModule,
    CommonUiModule,
    CorpusRoutingModule,
    CommonFormsModule,
    DragDropModule,
    FileModule,
    RenameDialogModule
  ],
  providers:[
    RawCorpusService,
    LogicalCorpusService
  ]
})
export class CorpusModule { }
