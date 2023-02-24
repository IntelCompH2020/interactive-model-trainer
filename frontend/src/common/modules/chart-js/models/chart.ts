import { ChartData } from '@common/modules/chart-js/models/chart-data';
import { ChartOptions } from '@common/modules/chart-js/models/chart-options';
import { ChartType } from '@common/modules/chart-js/models/chart-type';

export interface Chart {
	type: ChartType;
	data: ChartData;
	options: ChartOptions;
	labels: string[];
}
