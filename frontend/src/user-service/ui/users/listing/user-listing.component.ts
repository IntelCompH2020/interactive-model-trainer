import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { IsActiveTypePipe } from '@app/core/formatting/pipes/is-active-type.pipe';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { ContactInfoType } from '@notification-service/core/enum/contact-info-type.enum';
import { UserServiceUser, UserServiceUserContactInfo } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { UserService } from '@user-service/services/http/user.service';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './user-listing.component.html',
	styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent extends BaseListingComponent<UserServiceUser, UserLookup> implements OnInit {

	userSettingsKey = { key: 'UserListingUserSettings' };

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		public authService: AuthService,
		private userService: UserService,
		private pipeService: PipeService
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): UserLookup {
		const lookup = new UserLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };

		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [nameof<UserServiceUser>(x => x.name)] };
		lookup.project = {
			fields: [
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.name),
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.type),
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.value),
				nameof<UserServiceUser>(x => x.isActive)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<UserServiceUser>(x => x.name),
			sortable: true,
			languageName: 'USER-SERVICE.USER-LISTING.FIELDS.NAME'
		}, {
			valueFunction: (item: UserServiceUser) => this.getEmail(item),
			prop: 'email',
			sortable: true,
			languageName: 'USER-SERVICE.USER-LISTING.FIELDS.EMAIL'
		}, {
			valueFunction: (item: UserServiceUser) => this.getMobilePhone(item),
			prop: 'mobilePhone',
			sortable: true,
			languageName: 'USER-SERVICE.USER-LISTING.FIELDS.MOBILE-PHONE'
		}, {
			valueFunction: (item: UserServiceUser) => this.getLandlinePhone(item),
			prop: 'landlinePhone',
			sortable: true,
			languageName: 'USER-SERVICE.USER-LISTING.FIELDS.LANDLINE-PHONE'
		}, {
			prop: nameof<UserServiceUser>(x => x.isActive),
			sortable: true,
			languageName: 'USER-SERVICE.USER-LISTING.FIELDS.IS-ACTIVE',
			pipe: this.pipeService.getPipe<IsActiveTypePipe>(IsActiveTypePipe)
		}]);
	}

	onColumnsChanged(event: ColumnsChangedEvent) {
		// Here are defined the projection fields that always requested from the api.
		const customProperties = ['email', 'mobilePhone', 'landlinePhone'];
		this.lookup.project = {
			fields: [
				nameof<UserServiceUser>(x => x.id),
				...event.properties.filter(x => !customProperties.includes(x.toString())).map(x => x.toString())]
		};
		if (event.properties.filter(x => customProperties.includes(x.toString())).length > 0) {
			this.lookup.project.fields.push(...[
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.type),
				nameof<UserServiceUser>(x => x.contacts) + '.' + nameof<UserServiceUserContactInfo>(x => x.value)
			]);
		}
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<UserServiceUser>> {
		return this.userService.query(this.lookup);
	}

	private getEmail(user: UserServiceUser): string {
		if (!user || !Array.isArray(user.contacts)) { return null; }
		const contact = user.contacts.filter(x => x.type === ContactInfoType.Email)[0];
		return contact ? contact.value : null;
	}

	private getMobilePhone(user: UserServiceUser): string {
		if (!user || !Array.isArray(user.contacts)) { return null; }
		const contact = user.contacts.filter(x => x.type === ContactInfoType.MobilePhone)[0];
		return contact ? contact.value : null;
	}

	private getLandlinePhone(user: UserServiceUser): string {
		if (!user || !Array.isArray(user.contacts)) { return null; }
		const contact = user.contacts.filter(x => x.type === ContactInfoType.LandLinePhone)[0];
		return contact ? contact.value : null;
	}
}
