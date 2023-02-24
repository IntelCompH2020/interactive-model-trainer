import { ChartDataset } from '@common/modules/chart-js/models/chart-dataset';

export interface ChartData {
	datasets: ChartDataset[];
	labels: string[];
}
