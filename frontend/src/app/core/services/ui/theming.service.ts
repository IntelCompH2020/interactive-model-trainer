import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ThemeType } from '@app/core/enum/theme-type.enum';

@Injectable()
export class ThemingService {

	private themeClasses: Map<ThemeType, string>;
	private themeChangeSubject = new Subject<ThemeType>();
	private currentTheme = ThemeType.Blue;

	constructor() {
		this.themeClasses = new Map<ThemeType, string>();
		this.themeClasses.set(ThemeType.Primary,'primary-theme');
		this.themeClasses.set(ThemeType.Blue, 'blue-theme');
		this.themeClasses.set(ThemeType.Pink, 'pink-theme');
	}

	getThemeClasses(): string[] {
		const values: string[] = [];
		this.themeClasses.forEach((value) => values.push(value));
		return values;
	}

	getThemeClass(theme: ThemeType): string {
		return this.themeClasses.get(theme);
	}

	themeSelected(theme: ThemeType) {
		if (this.currentTheme === theme) { return; }
		this.currentTheme = theme;
		this.themeChangeSubject.next(theme);
	}

	getThemeChangeObservable(): Observable<ThemeType> {
		return this.themeChangeSubject.asObservable();
	}

	getCurrentTheme(): ThemeType {
		return this.currentTheme;
	}

	getImage(path: string, extension: string): string {
		return path + '_' + this.currentTheme + extension;
	}
}
