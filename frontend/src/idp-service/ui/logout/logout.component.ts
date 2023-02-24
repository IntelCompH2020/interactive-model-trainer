import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/ui/auth.service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
	constructor(
		private keycloak: KeycloakService,
		private authService: AuthService,
		private installationConfigurationService: InstallationConfigurationService,
		private router: Router) { }

	ngOnInit() {
		this.authService.clear();
		this.keycloak.logout(location.origin).then(() => {
			localStorage.clear();
			// this.router.navigate(['./'], { replaceUrl: true });
		});
	}
}
