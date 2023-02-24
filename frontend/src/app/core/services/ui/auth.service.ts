
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppPermission } from '@app/core/enum/permission.enum';
import { RoleType } from '@app/core/enum/role-type.enum';
import { AppAccount } from '@app/core/model/auth/principal.model';
import { PrincipalService as AppPrincipalService, PrincipalService } from '@app/core/services/http/principal.service';
import { BaseService } from '@common/base/base.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { NotificationServicePermission } from '@notification-service/core/enum/permission.enum';
import { NotificationServiceAccount } from '@notification-service/core/model/principal.model';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { exhaustMap, map, takeUntil } from 'rxjs/operators';

export interface ResolutionContext {
	roles: RoleType[];
	permissions: AppPermission[];
}

export interface AuthenticationToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	state?: string;
}

export interface AuthenticationState {
	loginStatus: LoginStatus;
}

export enum LoginStatus {
	LoggedIn = 0,
	LoggingOut = 1,
	LoggedOut = 2
}

@Injectable()
export class AuthService extends BaseService {

	public authenticationStateSubject: Subject<AuthenticationState>;
	public permissionEnum = AppPermission;
	public notificationServicePermissionEnum = NotificationServicePermission;
	private accessToken: String;
	private appAccount: AppAccount;
	private notificationServiceAccount: NotificationServiceAccount;

	private _authState: boolean; // Boolean to indicate if a user if authorized. It's also used to sync the auth state across different tabs, using local storage.
	private _selectedTenant: string;

	constructor(
		private installationConfiguration: InstallationConfigurationService,
		private appPrincipalService: AppPrincipalService,
		private router: Router,
		private keycloakService: KeycloakService,
		private zone: NgZone,
		private route: ActivatedRoute,
		private language: TranslateService,
		private uiNotificationService: UiNotificationService,
		private loggingService: LoggingService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private principalService: PrincipalService
	) {
		super();
		// this.account = this.currentAccount();
		this.authenticationStateSubject = new Subject<AuthenticationState>();

		window.addEventListener('storage', (event: StorageEvent) => {
			// Logout if we receive event that logout action occurred in a different tab.
			if (event.key && event.key === 'authState' && event.newValue === 'false' && this._authState) {
				this.clear();
				//this.router.navigate(['/unauthorized'], { queryParams: { returnUrl: this.router.url } });
				window.location.href = installationConfiguration.authLogoutUri;
			}
		});
	}

	public getAuthenticationStateObservable(): Observable<AuthenticationState> {
		return this.authenticationStateSubject.asObservable();
	}

	public beginLogOutProcess(): void {
		this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggingOut });
	}

	public clear(): void {
		this.authState(false);
		this.selectedTenant(null);
		this.accessToken = undefined;
		this.appAccount = undefined;
		this.notificationServiceAccount = undefined;
	}

	private authState(authState?: boolean): boolean {
		if (authState !== undefined) {
			this._authState = authState;
			localStorage.setItem('authState', authState ? 'true' : 'false');
			if (authState) {
				this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggedIn });
			} else {
				this.authenticationStateSubject.next({ loginStatus: LoginStatus.LoggedOut });
			}
		}
		if (this._authState === undefined) {
			this._authState = localStorage.getItem('authState') === 'true' ? true : false;
		}
		return this._authState;
	}

	public selectedTenant(selectedTenant?: string): string {
		if (selectedTenant !== undefined) {
			this._selectedTenant = selectedTenant;
			if (selectedTenant == null) {
				localStorage.removeItem('selectedTenant');
			} else {
				localStorage.setItem('selectedTenant', selectedTenant);
			}
		}
		if (this._selectedTenant === undefined) {
			this._selectedTenant = localStorage.getItem('selectedTenant');
		}
		return this._selectedTenant;
	}

	public currentAccountIsAuthenticated(): boolean {
		return this.appAccount && this.appAccount.isAuthenticated;
	}

	//Should this be name @isAuthenticated@ instead?
	public hasAccessToken(): boolean { return Boolean(this.currentAuthenticationToken()); }

	public currentAuthenticationToken(accessToken?: String): String {
		if (accessToken) {
			this.accessToken = accessToken;
		}
		return this.accessToken;
	}

	//
	//
	// Account data
	//
	//
	public userId(): Guid {
		if (this.appAccount && this.appAccount.principal && this.appAccount.principal.userId) { return this.appAccount.principal.userId; }
		return null;
	}

	public tenantId(): Guid {
		return null;
	}

	public consentsRequireAttention(): boolean {
		return false;
	}

	public getPrincipalName(): string {
		if (this.appAccount && this.appAccount.principal) { return this.appAccount.principal.name; }
		return null;
	}

	public getUserProfileLanguage(): string {
		//if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.language; }
		return null;
	}

	public getUserProfileCulture(): string {
		//if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.culture; }
		return null;
	}

	public getUserProfileTimezone(): string {
		//if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.timezone; }
		return null;
	}

	public isAdmin(): boolean {
		return this.hasRole(RoleType.Admin);
	}

	public getUserProfilePictureRef(): string {
		//if (this.userServiceAccount && this.userServiceAccount.profile) { return this.userServiceAccount.profile.profilePictureRef; }
		return null;
	}

	//
	//
	// Me called on all services to get account data.
	//
	//
	public prepareAuthRequest(observable: Observable<string>, httpParams?: Object): Observable<boolean> {
		return observable.pipe(
			map((x) => this.currentAuthenticationToken(x)),
			exhaustMap(() => forkJoin([
				this.installationConfiguration.appServiceEnabled ? this.appPrincipalService.me(httpParams) : of(null)
			])),
			map((item) => {
				this.currentAccount(item[0]);
				return true;
			})
		);
	}

	private currentAccount(appAccount: AppAccount): void {
		this.appAccount = appAccount;
		this.authState(true);
	}

	public authenticate(returnUrl: string) {
		this.keycloakService.isLoggedIn().then(isLoggedIn => {
			console.debug('isLoggedIn -> ', isLoggedIn);
			if (!isLoggedIn) {
				this.keycloakService.login({}).then(() => {
					console.debug('Keycloak Login');
					this.keycloakService.keycloakEvents$.subscribe({
						next: (e) => {
							if (e.type == KeycloakEventType.OnTokenExpired) {
								this.refreshToken({});
							}
						}
					});
					this.onAuthenticateSuccess(returnUrl);
				}).catch((error) => this.onAuthenticateError(error));
			} else {
				this.router.navigate(['/login/post']);
				//this.prepareAuthRequest(from(this.keycloakService.getToken()), {}).pipe(takeUntil(this._destroyed)).subscribe(() => this.onAuthenticateSuccess(returnUrl), (error) => this.onAuthenticateError(error));
			}
		});
	}

	public refreshToken(httpParams?: Object): Promise<boolean> {
		return this.keycloakService.updateToken(60).then(isRefreshed => {

				if(!isRefreshed){
					return false;
				}
				
				return this.prepareAuthRequest(from(this.keycloakService.getToken()), httpParams).pipe(takeUntil(this._destroyed))
				.pipe(
					map(
							() =>{
								return true;
							},
							error =>{
								this.onAuthenticateError(error);
								return false
							}
						)
				).toPromise()
			});
	}

	onAuthenticateSuccess(returnUrl: string): void {
		this.authState(true);
		this.loggingService.info('Successful Login');
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-LOGIN'), SnackBarNotificationLevel.Success);
		this.zone.run(() => this.router.navigate([returnUrl]));
	}

	onAuthenticateError(errorResponse: HttpErrorResponse) {
		this.zone.run(() => {
			const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		});
	}

	//
	//
	// Permissions
	//
	//

	public hasPermission(permission: AppPermission): boolean {
		if (!this.installationConfiguration.appServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.appAccount?.permissions || [], permission);
	}

	public hasNotificationServicePermission(permission: NotificationServicePermission): boolean {
		if (!this.installationConfiguration.notificationServiceEnabled) { return true; } //TODO: maybe reconsider
		return this.evaluatePermission(this.notificationServiceAccount.permissions, permission);
	}

	private evaluatePermission(availablePermissions: string[], permissionToCheck: string): boolean {
		if (!permissionToCheck) { return false; }
		if (this.hasRole(RoleType.Admin)) { return true; }
		return availablePermissions.map(x => x.toLowerCase()).includes(permissionToCheck.toLowerCase());
	}

	public hasAnyRole(roles: RoleType[]): boolean {
		if (!roles) { return false; }
		return roles.filter((r) => this.hasRole(r)).length > 0;
	}

	public hasRole(role: RoleType): boolean {
		if (role === undefined) { return false; }
		if (this.appAccount?.principal?.more && this.appAccount?.principal?.more['Roles']?.length === 0) { return false; }
		return this.appAccount?.principal?.more['Roles']?.map(x => x.toLowerCase()).includes(role.toLowerCase());
	}

	public hasAnyPermission(permissions: AppPermission[]): boolean {
		if (!permissions) { return false; }
		return permissions.filter((p) => this.hasPermission(p)).length > 0;
	}

	public authorize(context: ResolutionContext): boolean {

		if (!context || this.hasRole(RoleType.Admin)) { return true; }

		let roleAuthorized = false;
		if (context.roles && context.roles.length > 0) {
			roleAuthorized = this.hasAnyRole(context.roles);
		}

		let permissionAuthorized = false;
		if (context.permissions && context.permissions.length > 0) {
			permissionAuthorized = this.hasAnyPermission(context.permissions);
		}

		if (roleAuthorized || permissionAuthorized) { return true; }

		return false;
	}

	public isLoggedIn(): boolean {
		return this.authState();
	}
}
