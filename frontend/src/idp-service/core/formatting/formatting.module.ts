import { NgModule } from '@angular/core';
import { CommonFormattingModule } from '@common/formatting/common-formatting.module';
import { IdpServiceEnumUtils } from '@idp-service/core/formatting/enum-utils.service';
import { IsActiveTypePipe } from '@idp-service/core/formatting/pipes/is-active-type.pipe';

//
//
// This is shared module that provides all idp service's formatting utils. Its imported only once on the AppModule.
//
//
@NgModule({
	imports: [
		CommonFormattingModule
	],
	declarations: [
		IsActiveTypePipe,

	],
	exports: [
		CommonFormattingModule,
		IsActiveTypePipe,
	],
	providers: [
		IdpServiceEnumUtils,
		IsActiveTypePipe,
	]
})
export class IdpServiceFormattingModule { }
