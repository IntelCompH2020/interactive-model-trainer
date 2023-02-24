export interface ToolTipsConfiguration {
	// Are tooltips enabled Default: true
	enabled?: Boolean;
	// See custom tooltip section. Default: null
	custom?: Function;
	// Sets which elements appear in the tooltip. Default: 'nearest'
	mode?: string;
	// if true, the tooltip mode applies only when the mouse position intersects with an element.If false, the mode will be applied at all times. Default: true
	intersect?: boolean;
	// The mode for positioning the tooltip. Default: 'average'
	position?: string;
	callbacks?: any;
	// Sort tooltip items
	itemSort?: any;
	// Filter tooltip items
	filter?: Function;
	// Background color of the tooltip. Default: 'rgba(0,0,0,0.8)'
	backgroundColor?: string;
	// "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	title font.
	titleFontFamily?: string;
	// Title font size. Default: 12
	titleFontSize?: number;
	// Title font style. Default: 'bold'
	titleFontStyle?: string;
	// Title font color. Default: '#fff'
	titleFontColor?: string;
	// Spacing to add to top and bottom of each title line. Default: 2
	titleSpacing?: number;
	// Margin to add on bottom of title section. Default: 6
	titleMarginBottom?: number;
	// "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	body line font.
	bodyFontFamily?: string;
	// Body font size. Default: 12
	bodyFontSize?: number;
	// Body font style. Default: 'normal'
	bodyFontStyle?: string;
	// Body font color. Default: '#fff'
	bodyFontColor?: string;
	// Spacing to add to top and bottom of each tooltip item. Default: 2
	bodySpacing?: number;
	// "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"	footer font.
	footerFontFamily?: string;
	// Footer font size. Default: 12
	footerFontSize?: number;
	// Footer font style. Default: 'bold'
	footerFontStyle?: string;
	// Footer font color. Default: '#fff'
	footerFontColor?: string;
	// Spacing to add to top and bottom of each fotter line. Default: 2
	footerSpacing?: number;
	// Margin to add before drawing the footer. Default: 6
	footerMarginTop?: number;
	// Padding to add on left and right of tooltip. Default: 6
	xPadding?: number;
	// Padding to add on top and bottom of tooltip. Default: 6
	yPadding?: number;
	// Extra distance to move the end of the tooltip arrow away from the tooltip point. Default: 2
	caretPadding?: number;
	// Size, in px, of the tooltip arrow. Default: 5
	caretSize?: number;
	// Radius of tooltip corner curves. Default: 6
	cornerRadius?: number;
	// Color to draw behind the colored boxes when multiple items are in the tooltip. Default: '#fff'
	multiKeyBackground?: string;
	// if true, color boxes are shown in the tooltip. Default: true
	displayColors?: boolean;
	// Color of the border. Default: 'rgba(0,0,0,0)'
	borderColor?: string;
	// Size of the border. Default: 0
	borderWidth?: number;
}
