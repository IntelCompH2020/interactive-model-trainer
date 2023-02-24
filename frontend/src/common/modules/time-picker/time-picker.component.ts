import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CultureService } from '@user-service/services/culture.service';
import { BaseComponent } from '@common/base/base.component';
import * as moment from 'moment';
import { IDatePickerDirectiveConfig } from 'ng2-date-picker';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-time-picker',
	templateUrl: './time-picker.component.html',
	styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent extends BaseComponent implements OnInit, OnChanges {

	datePickerConfig: IDatePickerDirectiveConfig;

	@Input() reactiveFormControl: FormControl;
	@Input() label: string;
	@Input() placeholder: string;
	@Input() validationError: string;
	@Input() required = false;
	@Input() floatLabel;

	textFormControl: FormControl;

	// formats used by Moment.js
	private readonly valueFormat = 'HH:mm';
	private readonly displayFormat = 'LT';
	private displayCulture = 'en-US';

	constructor(
		private cultureService: CultureService
	) {
		super();

		this.displayCulture = this.cultureService.getCurrentCulture().name;

		this.datePickerConfig = {
			locale: this.displayCulture,
			showSeconds: false,
			format: this.displayFormat, // here we can set any format that Moment.js supports
		};
	}

	ngOnInit() {
		this.textFormControl = new FormControl();
		this.textFormControl.setValue(this.transformValueToDisplayText(this.reactiveFormControl.value), { emitEvent: false });
		this.validate();

		this.textFormControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(value => {
			this.reactiveFormControl.setValue(this.transformDisplayTextToValue(value), { emitEvent: false });
			this.validate();
		});

		this.reactiveFormControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(value => {
			this.textFormControl.setValue(this.transformValueToDisplayText(value), { emitEvent: false });
			this.validate();
		});

		this.reactiveFormControl.registerOnDisabledChange((isDisabled: boolean) => {
			this._setDisabled(isDisabled);
			this.validate();
		});
		this._setDisabled(this.reactiveFormControl.disabled);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['validationError'] && !changes['validationError'].isFirstChange()) {
			this.validate();
		}
	}

	validate() {
		// We re-set the validators here in case they changed outside the component
		this.textFormControl.setValidators(this.reactiveFormControl.validator);
		this.textFormControl.markAsTouched();
		this.textFormControl.updateValueAndValidity({ emitEvent: false });
	}

	transformValueToDisplayText(value: string): string {
		const result = moment.utc(value, this.valueFormat, this.displayCulture);
		return result.isValid() ? result.format(this.displayFormat) : null;
	}

	transformDisplayTextToValue(value: string): string {
		const result = moment.utc(value, this.displayFormat, this.displayCulture);
		return result.isValid() ? result.format(this.valueFormat) : null;
	}

	private _setDisabled(isDisabled: boolean) {
		if (isDisabled) {
			this.textFormControl.disable({ emitEvent: false });
		} else {
			this.textFormControl.enable({ emitEvent: false });
		}
	}
}
