import { AbstractControl, FormArray, ValidatorFn, Validators } from '@angular/forms';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';

export function BackendErrorValidator(errorModel: ValidationErrorModel, propertyName: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getError(propertyName);
		return error ? { 'backendError': { message: error } } : null;
	};
}

export function E164PhoneValidator(): ValidatorFn {
	return Validators.pattern('^\\+?[1-9]\\d{1,14}$');
}

// Getter is required because the index of each element is not fixed (array does not always follow LIFO)
export function BackendArrayErrorValidator(errorModel: ValidationErrorModel, propertyNameGetter: () => string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getError(propertyNameGetter());
		return error ? { 'backendError': { message: error } } : null;
	};
}

export function CustomErrorValidator(errorModel: ValidationErrorModel, propertyNames: string[]): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const error: String = errorModel.getErrors(propertyNames);
		return error ? { 'customError': { message: error } } : null;
	};
}

export function EmailMatchValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		return control.get('email').value === control.get('emailConfirm').value ? null : { 'emailMismatch': true };
	};
}

export function PasswordMatchValidator(passwordControlName: string, repeatPasswordControlName: string): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const passwordControl = control.get(passwordControlName);
		const passwordRepeatControl = control.get(repeatPasswordControlName);

		if (passwordControl && passwordControl.value && passwordRepeatControl && passwordRepeatControl.value && passwordControl.value !== passwordRepeatControl.value) {
			return { 'passwordMismatch': true };
		}
		return null;
	};
}


export function atLeastItems(numberOfItems: number): ValidatorFn{
	return (control: AbstractControl): {[key: string]: any } =>{

		if(control instanceof FormArray){
			const fa = control as FormArray;
			if(fa.controls.length >= numberOfItems ){
				return null;
			}
			return { 'atLeastItems': numberOfItems };
		}

		return null;
	}
}
