import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent implements OnInit {

	constructor(
		route: ActivatedRoute,
		router: Router
	) {
		this.route = route;
		this.router = router;
	}

	private route: ActivatedRoute;
	private router: Router;

	ngOnInit() {
		const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
		this.router.navigate(['/login'], { queryParams: { returnUrl: returnUrl }, replaceUrl: true });
	}

}
