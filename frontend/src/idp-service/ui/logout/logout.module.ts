import { NgModule } from '@angular/core';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { LogoutRoutingModule } from '@idp-service/ui/logout/logout-routing.module';
import { LogoutComponent } from '@idp-service/ui/logout/logout.component';

@NgModule({
	imports: [
		CommonUiModule,
		LogoutRoutingModule,
	],
	declarations: [
		LogoutComponent
	],
	entryComponents: []
})
export class LogoutModule { }
