import { ValidatorFn } from '@angular/forms';

export class ValidationContext {
	validation: Validation[];

	getValidation(key: string): Validation {
		for (let i = 0; i < this.validation.length; i++) {
			if (this.validation[i].key === key) {
				return this.validation[i];
			}
		}
		throw new Error('Key ' + key + ' Was Not Found In The Validation Context');
	}
}

export class Validation {
	key: string;
	validators?: ValidatorFn[] = new Array<ValidatorFn>();
	descendantValidations?: ValidationContext;
}
