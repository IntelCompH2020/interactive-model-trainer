import { NgModule } from '@angular/core';
import { HomeRoutingModule } from '@app/ui/home/home-routing.module';
import { HomeComponent } from '@app/ui/home/home.component';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { HowToCardComponent } from './how-to-card/how-to-card.component';
@NgModule({
	imports: [
		CommonUiModule,
		HomeRoutingModule
	],
	declarations: [
		HomeComponent,
  OverviewCardComponent,
  HowToCardComponent,
	]
})
export class HomeModule { }