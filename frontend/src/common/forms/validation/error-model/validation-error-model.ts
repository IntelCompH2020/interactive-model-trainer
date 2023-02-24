import { Serializable } from '@common/types/json/serializable';

export class ValidationErrorModel implements Serializable<ValidationErrorModel> {
	public error: string;
	private message: Array<ErrorMessageItem>;

	public fromJSONObject(item: any): ValidationErrorModel {
		this.error = item.error;
		this.message = item.message;
		return this;
	}

	public getErrors(propertyNames: string[]): string {
		const errors: string[] = [];
		propertyNames.forEach(propertyName => {
			const error = this.getError(propertyName);
			if (error) { errors.push(error); }
		});
		return errors.join(', ');
	}

	public getError(propertyName: string): string {
		let error: string;
		if (this.message) {
			for (const element of this.message) {
				if (element.Key === propertyName) {
					error = element.Value.join(', ');
					break;
				}
			}
		}
		return error;
	}

	// errors by array index
	public getErrorForArray(arrayProperty: string, fieldProperty: string): Map<number, string> {
		const regExp = new RegExp(`^${arrayProperty}\\[([0-9]+)\\]\\.${fieldProperty}$`); // 1st group is index
		const errors = new Map<number, string>();
		if (this.message) {
			this.message.forEach(element => {
				const match = element.Key.match(regExp);
				if (match && match.length >= 2) {
					const index = Number.parseInt(match[1]);
					errors.set(index, element.Value.join(', '));
				}
			});
		}
		return errors;
	}

	public setError(propertyName: string, error: string) {
		if (this.message) {
			let exists = false;
			for (const element of this.message) {
				if (element.Key === propertyName) {
					if (!element.Value.includes(error)) { element.Value.push(error); }
					exists = true;
					break;
				}
			}
			if (!exists) { this.message.push({ Key: propertyName, Value: [error] }); }
		} else {
			this.message = [{ Key: propertyName, Value: [error] }];
		}
	}

	public clear() {
		this.error = undefined;
		if (this.message) {
			this.message.forEach(element => {
				element.Value.splice(0);
			});
		}
	}

	public clearPart(prefix: string) {
		if (this.message) {
			this.message.forEach(element => {
				if (element && element.Key && element.Key.startsWith(prefix)) {
					element.Value.splice(0);
				}
			});
		}
	}
}

class ErrorMessageItem {
	Key: string;
	Value: Array<string> = [];
}
