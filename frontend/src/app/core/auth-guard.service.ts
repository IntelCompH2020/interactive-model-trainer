import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService, ResolutionContext } from '@app/core/services/ui/auth.service';
import { from, Observable, of as observableOf, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
	constructor(private authService: AuthService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const url: string = state.url;
		const authContext = route.data ? route.data['authContext'] as ResolutionContext : null;
		return this.applyGuard(url, authContext);
	}

	canLoad(route: Route): Observable<boolean> {
		const url = `/${route.path}`;
		const authContext = route.data ? route.data['authContext'] as ResolutionContext : null;
		return this.applyGuard(url, authContext);
	}

	private applyGuard(url: string, authContext: ResolutionContext) {
		return this.checkLogin(url, authContext).pipe(tap(loggedIn => {
			if (!loggedIn) {
				this.router.navigate(['/unauthorized'], { queryParams: { returnUrl: url } });
			} else{
				const authorized = this.authService.hasAccessToken() && this.authService.authorize(authContext);
				if(!authorized){
					this.router.navigate(['/unauthorized']);
				}else{
					return authorized;
				}
			}
		}));
	}

	private checkGuard(url: string, authContext: ResolutionContext): Observable<boolean> {
		if (!this.authService.isLoggedIn()) { return observableOf(false); }

		return this.authService.hasAccessToken()
            ? observableOf(this.authService.authorize(authContext))
            : from(this.authService.refreshToken()).pipe(
                map(x => this.authService.hasAccessToken() && this.authService.authorize(authContext)
                ), catchError(x => of(false)));
	}
	private checkLogin(url: string, authContext: ResolutionContext): Observable<boolean> {
		if (!this.authService.isLoggedIn()) { return observableOf(false); }

		return this.authService.hasAccessToken()
            ? observableOf(true)
            : from(this.authService.refreshToken()).pipe(
                 catchError(x => of(false)));
	}
}
