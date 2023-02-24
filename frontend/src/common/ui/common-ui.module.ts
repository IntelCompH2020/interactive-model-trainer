import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SecureImagePipe } from '@common/http/image/secure-image.pipe';
import { MaterialModule } from '@common/material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		TranslateModule
	],
	declarations: [
		SecureImagePipe
	],
	exports: [
		CommonModule,
		MaterialModule,
		TranslateModule,
		SecureImagePipe
	]
})
export class CommonUiModule { }
