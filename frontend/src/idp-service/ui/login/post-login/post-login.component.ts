import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant } from '@app/core/model/tenant/tenant.model';
import { PrincipalService } from '@app/core/services/http/principal.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { BaseHttpParams } from '@common/http/base-http-params';
import { InterceptorType } from '@common/http/interceptors/interceptor-type';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { KeycloakService } from 'keycloak-angular';
import { from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './post-login.component.html',
	styleUrls: ['./post-login.component.scss'],
})
export class PostLoginComponent extends BaseComponent implements OnInit {
	formGroup: FormGroup = null;
	protected formBuilder: FormBuilder = new FormBuilder();

	protected tenants: Partial<Tenant>[] = [];
	protected selectedTenant = null;

	returnUrl: string;

	constructor(
		private formService: FormService,
		private route: ActivatedRoute,
		private router: Router,
		public installationConfiguration: InstallationConfigurationService,
		private authService: AuthService,
		private keycloakService: KeycloakService,
		private principalService: PrincipalService
	) {
		super();
	}

	ngOnInit(): void {
		this.formGroup = this.formBuilder.group({
			tenantCode: ['', [Validators.required]]
		});
		if (this.authService.hasAccessToken()) {
			this.loadUserTenants();
		} else {
			this.keycloakService.getToken().then(token => {
				this.authService.currentAuthenticationToken(token);
				this.loadUserTenants();
			});
		}
	}

	loadUserTenants() {
		const params = new BaseHttpParams();
		params.interceptorContext = {
			excludedInterceptors: [InterceptorType.TenantHeaderInterceptor]
		};
		if (this.authService.selectedTenant()) {
			this.loadUser();
			return;
		}
		this.principalService.myTenants({ params: params }).subscribe(myTenants => {
			if (myTenants) {
				if (myTenants.length > 1) {
					this.tenants = myTenants.map(function (code) { return { 'code': code }; });
				} else if (myTenants.length === 1) {
					this.authService.selectedTenant(myTenants[0]);
					this.loadUser();
				} else {
					this.authService.selectedTenant(null);
					this.loadUser();
				}
			} else {
				this.authService.selectedTenant(null);
				this.loadUser();
			}
		});
	}

	loadUser(): void {
		this.authService.prepareAuthRequest(from(this.keycloakService.getToken()), {}).pipe(takeUntil(this._destroyed)).subscribe(() => this.authService.onAuthenticateSuccess('/home'), (error) => this.authService.onAuthenticateError(error));
	}

	save(e: Event): void {
		e.preventDefault();
		this.formSubmit();
		this.loadUser();
	}

	cancel(): void {
		this.router.navigate(['/logout']);
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.selectedTenant = this.formGroup.value['tenantCode'];
		this.authService.selectedTenant(this.selectedTenant);
	}

	public isFormValid(): Boolean {
		return this.formGroup.valid;
	}

	clearErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
