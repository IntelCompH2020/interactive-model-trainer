import { OverlayContainer } from '@angular/cdk/overlay';
import { AfterViewInit, Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ThemeType } from '@app/core/enum/theme-type.enum';
import { AuthService, LoginStatus } from '@app/core/services/ui/auth.service';
import { ThemingService } from '@app/core/services/ui/theming.service';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { TranslateService } from '@ngx-translate/core';
import { CultureService } from '@user-service/services/culture.service';
import { LanguageService } from '@user-service/services/language.service';
import { TimezoneService } from '@user-service/services/timezone.service';
import { CookieService } from 'ngx-cookie-service';
import { takeUntil } from 'rxjs/operators';
import { PrincipalService } from './core/services/http/principal.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements OnInit, AfterViewInit {
	@HostBinding('class') componentCssClass;

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private authService: AuthService,
		private translate: TranslateService,
		private overlayContainer: OverlayContainer,
		private cookieService: CookieService,
		public themingService: ThemingService,
		private languageService: LanguageService,
		private cultureService: CultureService,
		private timezoneService: TimezoneService,
		private logger: LoggingService,
		private dialog: MatDialog,
		private principalService: PrincipalService
	) {
		super();

		this.initializeServices();

		this.authService.getAuthenticationStateObservable().pipe(takeUntil(this._destroyed)).subscribe(authenticationState => {
			if (authenticationState.loginStatus === LoginStatus.LoggedIn) {
				this.updateServices();
			}
		});
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

	}

	isMac(): boolean {
		let bool = false;
		if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
			bool = true;
		}
		return bool;
	}

	initializeServices() {
		// this language will be used as a fallback when a translation isn't found in the current language
		this.translate.setDefaultLang('en');
		// the lang to use, if the lang isn't available, it will use the current loader to get them
		this.translate.use(this.languageService.getLanguageValue(this.installationConfiguration.defaultLanguage));
		this.languageService.languageSelected(this.installationConfiguration.defaultLanguage, false);

		this.cultureService.cultureSelected(this.installationConfiguration.defaultCulture);
		this.timezoneService.timezoneSelected(this.installationConfiguration.defaultTimezone);

		const selectedTheme: ThemeType = Number.parseInt(this.cookieService.get('theme')) || this.installationConfiguration.defaultTheme;
		this.overlayContainer.getContainerElement().classList.add(this.themingService.getThemeClass(selectedTheme));
		this.componentCssClass = this.themingService.getThemeClass(selectedTheme);
		this.themingService.themeSelected(selectedTheme);

		this.setupChangeListeners();
	}

	updateServices() {
		const language = this.authService.getUserProfileLanguage();
		if (language) {
			const accLanguage = this.languageService.getLanguageKey(language);
			if (accLanguage !== undefined) {
				this.translate.use(language);
				this.languageService.languageSelected(accLanguage, false);
			} else { // TODO: throw error if unsupported language?
				this.logger.error(`unsupported language: ${language}`);
			}
		}

		const culture = this.authService.getUserProfileCulture();
		if (culture) {
			const accCulture = this.cultureService.getCultureValue(culture);
			if (accCulture !== undefined) {
				this.cultureService.cultureSelected(accCulture);
			} else { // TODO: throw error if unsupported culture?
				this.logger.error(`unsupported culture: ${culture}`);
			}
		}

		const timezone = this.authService.getUserProfileTimezone();
		if (timezone) {
			if (this.timezoneService.hasTimezoneValue(timezone)) {
				this.timezoneService.timezoneSelected(timezone);
			} else { // TODO: throw error if unsupported timezone?
				this.logger.error(`unsupported timezone: ${timezone}`);
			}
		}
	}

	setupChangeListeners() {
		this.languageService.getLanguageChangeObservable().pipe(takeUntil(this._destroyed)).subscribe(newLanguage => {
			const selectedLanguageValue = this.languageService.getLanguageValue(newLanguage);
			this.translate.use(selectedLanguageValue);
		});

		this.themingService.getThemeChangeObservable().pipe(takeUntil(this._destroyed)).subscribe(newTheme => {
			const overlayContainer = this.overlayContainer.getContainerElement();
			const selectedThemeClass = this.themingService.getThemeClass(newTheme);
			this.themingService.getThemeClasses().forEach(theme => {
				if (theme !== selectedThemeClass) { overlayContainer.classList.remove(theme); }
			});

			overlayContainer.classList.add(selectedThemeClass);
			this.componentCssClass = selectedThemeClass;
			this.cookieService.set('theme', newTheme.toString(), null, '/');
		});
	}

	public isAuthenticated(): boolean {
		return this.authService.currentAccountIsAuthenticated();
	}
}
