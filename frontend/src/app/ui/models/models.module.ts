import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelsComponent } from './models.component';
import { ModelsRoutingModule } from './models-routing.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TopicModelsListingComponent } from './topic-models-listing/topic-models-listing.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NewTopicModelComponent } from './topic-models-listing/new-topic-model/new-topic-model.component';
import { DomainModelsListingComponent } from './domain-models-listing/domain-models-listing.component';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { DomainModelFromSourceFileComponent } from './domain-models-listing/domain-model-from-source-file/domain-model-from-source-file.component';
import { DomainModelFromKeywordsComponent } from './domain-models-listing/domain-model-from-keywords/domain-model-from-keywords.component';
import { DomainModelFromSelectionFunctionComponent } from './domain-models-listing/domain-model-from-selection-function/domain-model-from-selection-function.component';
import { DomainModelFromCategoryNameComponent } from './domain-models-listing/domain-model-from-category-name/domain-model-from-category-name.component';
import { TrainingProgressModelDialogModule } from '@common/modules/training-model-progress/training-model-dialog.module';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { ModelParametersComponent } from './model-parameters-table/model-parameters-table.component';
import { TopicsListingComponent } from './topic-models-listing/topics-listing/topics-listing.component';
import { ModelDetailsComponent } from './model-details/model-details.component';
import { PyLDAComponent } from './topic-models-listing/py-lda-vis-modal/py-lda-vis-modal.component';
import { FormattingModule } from '@app/core/formatting/formatting.module';
import { TopicSelectionComponent } from './topic-models-listing/topic-selection-modal/topic-selection-modal.component';
import { TopicSimilaritiesComponent } from './topic-models-listing/topic-similarities-modal/topic-similarities-modal.component';
import { TopicLabelsComponent } from './topic-models-listing/topic-labels-modal/topic-labels-modal.component';
import { RenameTopicComponent } from './topic-models-listing/rename-topic/rename-topic.component';
import { NewHierarchicalTopicModelComponent } from './topic-models-listing/new-hierarchical-topic-model/new-hierarchical-topic-model.component';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { ModelPatchComponent } from './model-patch/model-patch-modal.component';
import { RenameDialogModule } from '../rename-dialog/rename-dialog.module';
import { RunningTasksService } from '@app/core/services/http/running-tasks.service';
import { DomainModelCurationDialogComponent } from './domain-models-listing/domain-model-curation-dialog/domain-model-curation-dialog.component';
import { DocumentsListingComponent } from './domain-models-listing/documents-listing/documents-listing.component';
import { ModelTaskDetailsComponent } from './model-task-details/model-task-details.component';

@NgModule({
  declarations: [
    ModelsComponent,
    TopicModelsListingComponent,
    NewTopicModelComponent,
    NewHierarchicalTopicModelComponent,
    RenameTopicComponent,
    DomainModelsListingComponent,
    DomainModelFromSourceFileComponent,
    DomainModelFromKeywordsComponent,
    DomainModelFromSelectionFunctionComponent,
    DomainModelFromCategoryNameComponent,
    ModelParametersComponent,
    ModelDetailsComponent,
    ModelTaskDetailsComponent,
    ModelPatchComponent,
    TopicsListingComponent,
    PyLDAComponent,
    TopicSelectionComponent,
    TopicSimilaritiesComponent,
    TopicLabelsComponent,
    DomainModelCurationDialogComponent,
    DocumentsListingComponent
  ],
  imports: [
    CommonModule,
    ListingModule,
    CommonUiModule,
    ModelsRoutingModule,
    TrainingProgressModelDialogModule,
    CommonFormsModule,
    RenameDialogModule,
    FormattingModule
  ],
  providers:[
    TopicModelService,
    DomainModelService,
    LogicalCorpusService,
    StopwordService,
    EquivalenceService,
    KeywordService,
    RunningTasksService
  ]
})
export class ModelsModule { }
