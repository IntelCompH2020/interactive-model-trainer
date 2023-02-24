import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActiveTypePipe } from '@app/core/formatting/pipes/is-active-type.pipe';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnsChangedEvent, PageLoadEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { Notification } from '@notification-service/core/model/notification.model';
import { NotificationLookup } from '@notification-service/core/query/notification.lookup';
import { NotificationService } from '@notification-service/services/http/notification.service';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	templateUrl: './notification-listing.component.html',
	styleUrls: ['./notification-listing.component.scss']
})
export class NotificationListingComponent extends BaseListingComponent<Notification, NotificationLookup> implements OnInit {

	userSettingsKey = { key: 'NotificationListingUserSettings' };

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private notificationService: NotificationService,
		private pipeService: PipeService,
		public authService: AuthService,
		private enumUtils: NotificationServiceEnumUtils,
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): NotificationLookup {
		const lookup = new NotificationLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 10, size: 10 };

		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [nameof<Notification>(x => x.createdAt)] };
		lookup.project = {
			fields: [
				nameof<Notification>(x => x.id),
				nameof<Notification>(x => x.isActive),
				nameof<Notification>(x => x.type),
				nameof<Notification>(x => x.contactType),
				nameof<Notification>(x => x.notifyState),
				nameof<Notification>(x => x.notifiedAt),
				nameof<Notification>(x => x.trackingState),
				nameof<Notification>(x => x.trackingProcess),
				nameof<Notification>(x => x.provenanceType),
				nameof<Notification>(x => x.createdAt)
			]
		};

		return lookup;
	}

	protected setupColumns() {
		this.gridColumns.push(...[{
			prop: nameof<Notification>(x => x.user) + '.' + nameof<UserServiceUser>(x => x.name),
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.USER-NAME'
		}, {
			prop: nameof<Notification>(x => x.isActive),
			valueFunction: (x: Notification) => this.enumUtils.toIsActiveString(x.isActive),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.IS-ACTIVE',
			pipe: this.pipeService.getPipe<IsActiveTypePipe>(IsActiveTypePipe)
		}, {
			prop: nameof<Notification>(x => x.type),
			valueFunction: (x: Notification) => this.enumUtils.toNotificationTypeString(x.type),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.TYPE'
		}, {
			prop: nameof<Notification>(x => x.contactType),
			valueFunction: (x: Notification) => this.enumUtils.toContactTypeString(x.contactType),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.CONTACT-TYPE'
		}, {
			prop: nameof<Notification>(x => x.notifyState),
			valueFunction: (x: Notification) => this.enumUtils.toNotificationNotifyStateString(x.notifyState),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.NOTIFY-STATE'
		}, {
			prop: nameof<Notification>(x => x.notifiedAt),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.NOTIFIED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}, {
			prop: nameof<Notification>(x => x.trackingState),
			valueFunction: (x: Notification) => this.enumUtils.toNotificationTrackingStateString(x.trackingState),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.TRACKING-STATE'
		}, {
			prop: nameof<Notification>(x => x.trackingProcess),
			valueFunction: (x: Notification) => this.enumUtils.toNotificationTrackingProcessString(x.trackingProcess),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.TRACKING-PROCESS'
		}, {
			prop: nameof<Notification>(x => x.provenanceType),
			valueFunction: (x: Notification) => this.enumUtils.toNotificationTypeString(x.provenanceType),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.PROVENANCE-TYPE'
		}, {
			prop: nameof<Notification>(x => x.createdAt),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.NOTIFICATION-LISTING.FIELDS.CREATED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}]);
	}

	onColumnsChanged(event: ColumnsChangedEvent) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<Notification>(x => x.id),
				...event.properties.filter(x => x).map(x => x.toString())
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<Notification>> {
		return this.notificationService.query(this.lookup);
	}
}
