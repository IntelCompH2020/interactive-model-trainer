export interface ChartTitleConfiguration {
	/**
	 * Display the title block
	 * Defaults to false
	 */
	display?: boolean;
	/**
	 * Position of the title. Only 'top' or 'bottom' are currently allowed
	 * Defaults to 'top'
	 */
	position?: string;
	/**
	 * Marks that this box should take the full width of the canvas (pushing down other boxes)
	 * Defaults to true
	 */
	fullWidth?: boolean;
	/**
	 * Font size inherited from global configuration
	 * Defaults to 12
	 */
	fontSize?: number;
	/**
	 * Font family inherited from global configuration
	 * Defaults to 	"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
	 */
	fontFamily?: string;
	/**
	 * Font color inherited from global configuration
	 * Defaults to #666
	 */
	fontColor?: string;
	/**
	 * Font styling of the title.
	 * Defaults to 'bold'
	 */
	fontStyle?: string;
	/**
	 * Number of pixels to add above and below the title text
	 * Defaults to 10
	 */
	padding?: number;
	/**
	 * Title text
	 * Defaults to ''
	 */
	text?: string;
}
