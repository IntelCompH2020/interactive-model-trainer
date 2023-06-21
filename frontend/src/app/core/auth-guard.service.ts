import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, ResolutionContext } from '@app/core/services/ui/auth.service';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { from, Observable, of as observableOf, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard extends KeycloakAuthGuard {
	
	constructor(private authService: AuthService, protected router: Router, protected keycloakService: KeycloakService) {
		super(router, keycloakService);
	}
	
	async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
		if (!this.authenticated) {
			this.authService.authenticate(window.location.origin + state.url)
		}
		return true;
	}

}
