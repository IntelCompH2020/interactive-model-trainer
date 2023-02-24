import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as QRCode from 'qrcodejs2';
import { LoggingService } from '@common/logging/logging-service';

@Component({
	selector: 'app-qr-code',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: ''
})
export class QRCodeComponent implements OnChanges, OnInit {

	@Input() public colorDark = '#000000';
	@Input() public colorLight = '#ffffff';
	@Input() public correctLevel: CorrectLevel = CorrectLevel.M;
	@Input() public size = 256;
	@Input() public text = '';
	@Input() public useSVG = false;

	public qrCode: any;

	constructor(
		public el: ElementRef,
		private logger: LoggingService
	) { }

	public ngOnInit() {
		try {
			if (!this.isValidQrCodeText(this.text)) {
				throw new Error('Empty QR Code data');
			}

			this.qrCode = new QRCode(this.el.nativeElement, {
				colorDark: this.colorDark,
				colorLight: this.colorLight,
				correctLevel: QRCode.CorrectLevel[this.correctLevel],
				height: this.size,
				width: this.size,
				text: this.text,
				useSVG: this.useSVG,
			});
		} catch (e) {
			this.logger.error('Error generating QR Code: ' + e.message);
		}
	}

	public ngOnChanges(changes: SimpleChanges) {
		if (!this.qrCode) {
			return;
		}

		const text = changes['text'];

		if (text && this.isValidQrCodeText(text.currentValue)) {
			this.qrCode.clear();
			this.qrCode.makeCode(text.currentValue);
		}
	}

	protected isValidQrCodeText = (data: string): boolean => {
		return !(typeof data === 'undefined' || data === '');
	}
}

export enum CorrectLevel {
	L = 'L',
	M = 'M',
	Q = 'Q',
	H = 'H'
}
