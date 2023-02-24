import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { CoreAppServiceModule } from '@app/core/services/core-service.module';
import { NavigationModule } from '@app/ui/misc/navigation/navigation.module';
import { BaseHttpService } from '@common/base/base-http.service';
import { MomentUtcDateAdapter } from '@common/date/moment-utc-date-adapter';
import { CommonHttpModule } from '@common/http/common-http.module';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { UiNotificationModule } from '@common/modules/notification/ui-notification.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CoreNotificationServiceModule } from '@notification-service/services/core-service.module';
import { CoreUserServiceModule } from '@user-service/core/core-service.module';
import { CultureService } from '@user-service/services/culture.service';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { TenantChooseDialogModule } from './ui/tenant/choose-dialog/tenant-choose-dialog.module';
import { FooterComponent } from './ui/footer/footer.component';
import { TrainingProgressModelDialogModule } from '@common/modules/training-model-progress/training-model-dialog.module';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { BaseHttpParams } from '@common/http/base-http-params';
import { AuthService } from './core/services/ui/auth.service';
import {from} from 'rxjs';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function InstallationConfigurationFactory(appConfig: InstallationConfigurationService, keycloak: KeycloakService, baseHttpServcie: BaseHttpService, authService: AuthService) {
	return () => appConfig.loadInstallationConfiguration().then(x => keycloak.init({
      config: {
        url: appConfig.idpServiceAddress,
				realm: appConfig.authRealm,
        clientId: appConfig.authClientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        flow: appConfig.authFlow,
				checkLoginIframe: false
      },
	  shouldAddToken:() => false
    }).then((response) => {
		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [
				// InterceptorType.AuthToken,
				InterceptorType.TenantHeaderInterceptor,
				InterceptorType.JSONContentType,
				InterceptorType.Locale,
				InterceptorType.ProgressIndication,
				InterceptorType.RequestTiming,
				InterceptorType.UnauthorizedResponse,
				InterceptorType.ErrorHandlerInterceptor
			]
		};
		const tokenPromise = keycloak.getToken();
		return authService.prepareAuthRequest(from(tokenPromise), {params}).toPromise().catch(error => authService.onAuthenticateError(error));
	}));
}

@NgModule({
	imports: [
		BrowserModule,
		BrowserAnimationsModule,

		//CoreServices
		CoreAppServiceModule.forRoot(),
		CoreNotificationServiceModule.forRoot(),
		CoreUserServiceModule.forRoot(),

		KeycloakAngularModule,

		AppRoutingModule,
		CommonUiModule,
		TrainingProgressModelDialogModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		HttpClientModule,
		OverlayModule,
		CommonHttpModule,
		MatMomentDateModule,
		MatMomentDatetimeModule,
		// ErrorsModule,

		//Ui
		UiNotificationModule,
		NavigationModule,
		TenantChooseDialogModule,

		OAuthModule.forRoot()
	],
	declarations: [
		AppComponent,
  		FooterComponent
	],
	providers: [
		InstallationConfigurationService,
		AuthService,
		{
			provide: APP_INITIALIZER,
			useFactory: InstallationConfigurationFactory,
			deps: [InstallationConfigurationService, KeycloakService, BaseHttpService, AuthService],
			multi: true
		},
		{ provide: OAuthStorage, useValue: localStorage },
		{
			provide: MAT_DATE_LOCALE,
			deps: [CultureService],
			useFactory: (cultureService) => cultureService.getCurrentCulture().name
		},
		{ provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
		{ provide: DateAdapter, useClass: MomentUtcDateAdapter },
		{
			provide: LOCALE_ID,
			deps: [CultureService, InstallationConfigurationService],
			useFactory: (cultureService, installationConfigurationService) => cultureService.getCurrentCulture(installationConfigurationService).name
		},
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: {
				appearance: 'outline'
			}
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
