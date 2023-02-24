import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

declare var Chart;

@Component({
	selector: 'app-chart-js',
	template: '',
	styles: [':host { display: block; }']
})
export class ChartJsComponent implements OnInit, OnChanges {
	chart: any;

	@Input() type: string;
	@Input() data: any;
	@Input() options: any;

	private canvas;

	constructor(private elementRef: ElementRef) { }

	ngOnInit() {
		this.create();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.chart) {
			if (changes['type'] || changes['options']) {
				this.create();
			} else if (changes['data']) {
				const currentValue = changes['data'].currentValue;
				['datasets', 'labels', 'xLabels', 'yLabels'].forEach(property => {
					this.chart.data[property] = currentValue[property];
				});
				this.chart.update();
			}
		}
	}

	private create() {
		if (this.canvas) {
			this.elementRef.nativeElement.removeChild(this.canvas);
		}
		this.canvas = document.createElement('canvas');
		this.elementRef.nativeElement.appendChild(this.canvas);
		Chart.plugins.register({
			beforeDraw: function (chartInstance) {
				const ctx = chartInstance.chart.ctx;
				ctx.fillStyle = 'transparent';
				ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
			}
		});
		Chart.plugins.register({

			defaultOptions: {
				x: 0,
				y: 0,

				height: false,
				width: false,

				alignX: 'top',
				alignY: 'left',
				alignToChartArea: false,
				position: 'front',
				opacity: 1,
				image: false,
			},

			isPercentage: function (value) {
				return typeof (value) === 'string' && value.charAt(value.length - 1) === '%';
			},

			calcPercentage: function (percentage, max) {
				let value = percentage.substr(0, percentage.length - 1);
				value = parseFloat(value);

				return max * (value / 100);
			},

			autoPercentage: function (value, maxIfPercentage) {
				if (this.isPercentage(value)) {
					value = this.calcPercentage(value, maxIfPercentage);
				}

				return value;
			},

			imageFromString: function (imageSrc) {
				// create the image object with this as our src
				const imageObj = new Image();
				imageObj.src = imageSrc;

				return imageObj;
			},

			drawWatermark: function (chartInstance, position) {
				const watermark = chartInstance.watermark;

				// only draw watermarks meant for us
				if (watermark.position !== position) { return; }

				if (watermark.image) {
					const image = watermark.image;

					const context = chartInstance.chart.ctx;
					const canvas = context.canvas;

					let cHeight, cWidth;
					let offsetX = 0, offsetY = 0;

					if (watermark.alignToChartArea) {
						const chartArea = chartInstance.chartArea;

						cHeight = chartArea.bottom - chartArea.top;
						cWidth = chartArea.right - chartArea.left;

						offsetX = chartArea.left;
						offsetY = chartArea.top;
					} else {
						cHeight = canvas.clientHeight || canvas.height;
						cWidth = canvas.clientWidth || canvas.width;
					}

					let height = watermark.height || image.height;
					height = this.autoPercentage(height, cHeight);

					let width = watermark.width || image.width;
					width = this.autoPercentage(width, cWidth);

					let x = this.autoPercentage(watermark.x, cWidth);
					let y = this.autoPercentage(watermark.y, cHeight);

					switch (watermark.alignX) {
						case 'right':
							x = cWidth - x - width;
							break;
						case 'middle':
							x = (cWidth / 2) - (width / 2) - x;
							break;
					}

					switch (watermark.alignY) {
						case 'bottom':
							y = cHeight - y - height;
							break;
						case 'middle':
							y = (cHeight / 2) - (height / 2) - y;
							break;
					}

					// avoid unnecessary calls to context save/restore, just manually restore the single value we change
					const oldAlpha = context.globalAlpha;
					context.globalAlpha = watermark.opacity;

					context.clearRect(offsetX + x, offsetY + y, width, height);
					context.drawImage(image, offsetX + x, offsetY + y, width, height);

					context.globalAlpha = oldAlpha;
				}
			},

			beforeInit: function (chartInstance) {
				chartInstance.watermark = {};

				const helpers = Chart.helpers,
					options = chartInstance.options;

				if (options.watermark) {
					const clonedDefaultOptions = helpers.clone(this.defaultOptions),
						watermark = helpers.extend(clonedDefaultOptions, options.watermark);

					if (watermark.image) {
						let image = watermark.image;

						if (typeof (image) === 'string') {
							image = this.imageFromString(image);
						}

						// automatically refresh the chart once the image has loaded (if necessary)
						image.onload = function () {
							chartInstance.update();
						};

						watermark.image = image;
					}

					chartInstance.watermark = watermark;
				}
			},

			// draw the image behind most chart elements
			beforeDraw: function (chartInstance) {
				this.drawWatermark(chartInstance, 'back');
			},
			// draw the image in front of most chart elements
			afterDraw: function (chartInstance) {
				this.drawWatermark(chartInstance, 'front');
			},
		});
		this.chart = new Chart(this.canvas, {
			type: this.type,
			data: this.data,
			options: this.options
		});
	}

	getImage() {
		return this.chart.canvas.toDataURL();
	}
}
