import { NgModule } from '@angular/core';
import { HomeRoutingModule } from '@app/ui/home/home-routing.module';
import { HomeComponent } from '@app/ui/home/home.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { HowToCardComponent } from './how-to-card/how-to-card.component';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { MarkdownDialogModule } from '../markdown-dialog/markdown-dialog.module';
@NgModule({
	imports: [
		CommonUiModule,
		HomeRoutingModule,
		MarkdownDialogModule
	],
	declarations: [
		HomeComponent,
		OverviewCardComponent,
		HowToCardComponent,
	],
	providers: [
		TopicModelService
	]
})
export class HomeModule { }
