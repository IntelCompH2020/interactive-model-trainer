import { NgModule } from '@angular/core';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { TrainingModelProgressComponent } from './training-model-progress.component';
import { RunningTasksService } from '@app/core/services/http/running-tasks.service';

@NgModule({
	imports: [CommonUiModule],
	declarations: [TrainingModelProgressComponent],
	exports: [TrainingModelProgressComponent],
	providers: [
		TopicModelService,
    DomainModelService,
		RunningTasksService
	],
	entryComponents: [TrainingModelProgressComponent]
})
export class TrainingProgressModelDialogModule {
	constructor() { }
}
