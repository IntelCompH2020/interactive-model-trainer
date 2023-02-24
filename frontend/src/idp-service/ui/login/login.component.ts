import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { KeycloakService } from 'keycloak-angular';
import { from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum LoginComponentMode {
	Basic = 0,
	DirectLinkMail = 1,
}

@Component({
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
	returnUrl: string;

	constructor(
		private zone: NgZone,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private keycloakService: KeycloakService
	) {
		super();
	}

	ngOnInit() {
		// get return url from route parameters or default to '/home'
		// this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/login/post';
		// if(!this.authService.selectedTenant()){
		// 	this.returnUrl = '/login/post';
		// }

		// TODO CLEAN LOGIN-POST IF NOT USED
		this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
		this.keycloakService.isLoggedIn().then(isLoggedIn => {
			if (!isLoggedIn) {
				this.authService.authenticate('/login/post');
			} else {
				this.authService.prepareAuthRequest(from(this.keycloakService.getToken())).pipe(takeUntil(this._destroyed)).subscribe(
							() => { this.zone.run(() => this.router.navigate([this.returnUrl])); },
							(error) => this.authService.authenticate('/login/post') );

			}

		});
	}
}

