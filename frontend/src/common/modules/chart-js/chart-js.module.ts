// if (typeof window === 'object') {
// 	require('chart.js');
// }
import { NgModule } from '@angular/core';
import { ChartJsComponent } from '@common/modules/chart-js/chart-js.component';

@NgModule({
	declarations: [ChartJsComponent],
	exports: [ChartJsComponent]
})
export class ChartJsModule {
	constructor() { }
}
