import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';
import { TypeUtils } from '@common/utilities/type-utils.service';
import { LoggingService } from '@common/logging/logging-service';
import { Observable, Subject } from 'rxjs';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';

const availableCultures: CultureInfo[] = require('../../assets/localization/available-cultures.json');

export interface CultureInfo {
	name: string;
	displayName: string;
	nativeName: string;
}

@Injectable()
export class CultureService {

	private cultureValues = new Map<string, CultureInfo>(); // cultures by name
	private cultureChangeSubject = new Subject<CultureInfo>();
	private currentCulture: CultureInfo;

	constructor(
		private typeUtils: TypeUtils,
		private logger: LoggingService
	) {
		if (availableCultures) {
			this.cultureValues = new Map<string, CultureInfo>();
			availableCultures.forEach(culture => {
				this.cultureValues.set(culture.name, culture);
			});
		}
	}

	getCultureValues(): CultureInfo[] {
		const values: CultureInfo[] = [];
		this.cultureValues.forEach((value) => values.push(value));
		return values;
	}

	getCultureValue(culture: string): CultureInfo | undefined {
		return this.cultureValues.get(culture);
	}

	cultureSelected(culture: string | CultureInfo) {
		let newCultureName: string;
		if (this.typeUtils.isString(culture)) {
			if (this.currentCulture && this.currentCulture.name === culture) { return; }
			newCultureName = culture;
		} else {
			if (this.currentCulture && this.currentCulture.name === culture.name) { return; }
			newCultureName = culture.name;
		}

		const newCulture = this.cultureValues.get(newCultureName);
		if (!newCulture) {
			this.logger.error(`unsupported culture given: ${newCultureName}`); //TODO: throw error?
			return;
		}
		this.currentCulture = newCulture;
		this.cultureChangeSubject.next(newCulture);

		// Set angular locale based on user selection.
		// This is a very hacky way to map cultures with angular cultures, since there is no mapping. We first try to
		// use the culture with the specialization (ex en-US), and if not exists we import the base culture (first part).
		
		let locale = newCulture.name;
		import(`/node_modules/@angular/common/locales/${locale}.mjs`).catch(reason => {
			this.logger.error('Could not load locale: ' + locale);
		}).then(selectedLocale => {
			if (selectedLocale) {
				registerLocaleData(selectedLocale.default);
			} else {
				locale = newCulture.name.split('-')[0];
				import(`/node_modules/@angular/common/locales/${locale}.mjs`).catch(reason => {
					this.logger.error('Could not load locale: ' + locale);
				}).then(selectedDefaultLocale => {
					registerLocaleData(selectedDefaultLocale.default);
				});
			}
		});
	}

	getCultureChangeObservable(): Observable<CultureInfo> {
		return this.cultureChangeSubject.asObservable();
	}

	getCurrentCulture(installationConfigurationService?: InstallationConfigurationService): CultureInfo {
        if (this.currentCulture == null && installationConfigurationService != null) {
            this.cultureSelected(installationConfigurationService.defaultCulture);
        }
        return this.currentCulture;
    }

	private isString(value: any): value is string { return typeof value === 'string'; }

}
