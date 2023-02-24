import { ChartHoverConfiguration } from '@common/modules/chart-js/models/chart-hover-configuration';
import { ChartTitleConfiguration } from '@common/modules/chart-js/models/chart-title-configuration';
import { ToolTipsConfiguration } from '@common/modules/chart-js/models/tooltips-configuration';

export interface ChartOptions {
	scales?: {
		yAxes?: any[],
		xAxes?: any[],
	};
	/**
	 * Resizes when the canvas container does.
	 * Defaults to true
	 */
	responsive?: boolean;
	/**
	 * Duration in milliseconds it takes to animate to new size after a resize event.
	 * Defaults to 0
	 */
	responsiveAnimationDuration?: number;
	/**
	 * Maintain the original canvas aspect ratio (width / height) when resizing
	 * Defaults to true
	 */
	maintainAspectRatio?: boolean;
	/**
	 * Events that the chart should listen to for tooltips and hovering
	 * Defaults to ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]
	 */
	events?: string[];
	/**
	 * Called if the event is of type 'mouseup' or 'click'. Called in the context of the chart and passed an array of active elements
	 */
	onClick?: Function;
	/**
	 * Function to generate a legend. Receives the chart object to generate a legend from. Default implementation returns an HTML string.
	 */
	legendCallback?: Function;
	/**
	 * Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.
	 */
	onResize?: Function;
	title?: ChartTitleConfiguration;
	hover?: ChartHoverConfiguration;
	tooltips?: ToolTipsConfiguration;
	watermark?: any;
	layout?: any;
	elements?: any;
	animation?: any;
	legend?: any;
}
