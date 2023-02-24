export interface ChartDataset {
	/**
	 * The label for the dataset which appears in the legend and tooltips
	 */
	label: string;
	/**
	 * The data to plot in a line
	 */
	data: number[];
	/**
	 * Specifies if the data contained are a prediction
	 */
	isPrediction: boolean;
	/**
	 * Connections with other Datasets (for example Actual-Prediction)
	 */
	associatedWith: number[];
	/**
	 * The ID of the x axis to plot this dataset on
	 */
	xAxisID?: string;
	/**
	 * The ID of the y axis to plot this dataset on
	 */
	yAxisID?: string;
	/**
	 * If true, fill the area under the line
	 */
	fill?: boolean;
	/**
	 * Bezier curve tension of the line. Set to 0 to draw straightlines. Note This was renamed from 'tension' but the old name still works.
	 */
	lineTension?: number;
	/**
	 * The fill color under the line. See Colors
	 */
	backgroundColor?: string | string[];
	/**
	 * The width of the line in pixels
	 */
	borderWidth?: number;
	/**
	 * The color of the line.
	 */
	borderColor?: string | string[];
	/**
	 * Cap style of the line.
	 */
	borderCapStyle?: string;
	/**
	 * 	Length and spacing of dashes.
	 */
	borderDash?: number[];
	/**
	 * 	Offset for line dashes.
	 */
	borderDashOffset?: number[];
	/**
	 * Line joint style.
	 */
	borderJoinStyle?: string;
	/**
	 * The border color for points.
	 */
	pointBorderColor?: string | string[];
	/**
	 * The fill color for points
	 */
	pointBackgroundColor?: string | string[];
	/**
	 * The width of the point border in pixels
	 */
	pointBorderWidth?: number | number[];
	/**
	 * The radius of the point shape. If set to 0, nothing is rendered.
	 */
	pointRadius?: number | number[];
	/**
	 * The radius of the point when hovered
	 */
	pointHoverRadius?: number | number[];
	/**
	 * The pixel size of the non-displayed point that reacts to mouse events
	 */
	pointHitRadius?: number | number[];
	/**
	 * Point background color when hovered
	 */
	pointHoverBackgroundColor?: string | string[];
	/**
	 * Point border color when hovered
	 */
	pointHoverBorderColor?: string | string[];
	/**
	 * Border width of point when hovered
	 */
	pointHoverBorderWidth?: number | number[];
	/**
	 * The style of point. Options are 'circle', 'triangle', 'rect', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'. If the option is an image, that image is drawn on the canvas using drawImage.
	 */
	pointStyle?: string | string[];
	/**
	 * If false, the line is not drawn for this dataset
	 */
	showLine?: boolean;
	/**
	 * If true, lines will be drawn between points with no or null data
	 */
	spanGaps?: boolean;
	/**
	 * If true, the line is shown as a steeped line and 'lineTension' will be ignored
	 */
	steppedLine?: boolean;
	borderSkipped?: string | string[];
	hoverBackgroundColor?: string | string[];
	hoverBorderColor?: string | string[];
	hoverBorderWidth?: number | number[];
}
