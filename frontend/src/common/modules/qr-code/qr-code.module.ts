import { NgModule } from '@angular/core';
import { QRCodeComponent } from '@common/modules/qr-code/qr-code.component';

@NgModule({
	providers: [],
	declarations: [
		QRCodeComponent,
	],
	exports: [
		QRCodeComponent,
	]
})
export class QRCodeModule {
	constructor() { }
}
