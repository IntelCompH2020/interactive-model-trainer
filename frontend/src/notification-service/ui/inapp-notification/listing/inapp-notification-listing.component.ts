import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';
import { NotificationInAppTrackingTypePipe } from '@notification-service/core/formatting/pipes/notification-inapp-tracking-type.pipe';
import { InAppNotification } from '@notification-service/core/model/inapp-notification.model';
import { InAppNotificationLookup } from '@notification-service/core/query/inapp-notification.lookup';
import { InAppNotificationService } from '@notification-service/services/http/inapp-notification.service';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-inapp-notification-listing',
	templateUrl: './inapp-notification-listing.component.html',
	styleUrls: ['./inapp-notification-listing.component.scss']
})
export class InAppNotificationListingComponent extends BaseListingComponent<InAppNotification, InAppNotificationLookup> implements OnInit {
	@ViewChild('readColumnTemplate', { static: true }) readColumnTemplate: TemplateRef<any>;
	@Input() isPreviewList;
	@Output() previewModeChange = new EventEmitter<boolean>();

	userSettingsKey = { key: 'InAppNotificationListingUserSettings' };
	public notificationInAppTrackingEnum = NotificationInAppTracking;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		private inappNotificationService: InAppNotificationService,
		public authService: AuthService,
		private pipeService: PipeService,
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		// Lookup setup
		// Default lookup values are defined in the user settings class.
		this.lookup = this.initializeLookup();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	protected initializeLookup(): InAppNotificationLookup {
		const lookup = new InAppNotificationLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 10, size: 10 };

		lookup.isActive = [IsActive.Active];
		lookup.order = { items: [nameof<InAppNotification>(x => x.updatedAt)] };
		lookup.project = {
			fields: [
				nameof<InAppNotification>(x => x.id),
				nameof<InAppNotification>(x => x.subject),
				nameof<InAppNotification>(x => x.trackingState),
				nameof<InAppNotification>(x => x.createdAt)
			]
		};

		return lookup;
	}


	protected setupColumns() {
		this.gridColumns.push(...[{
			cellTemplate: this.readColumnTemplate,
			alwaysShown: true
		}, {
			prop: nameof<InAppNotification>(x => x.subject),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.INAPP-NOTIFICATION-LISTING.FIELDS.SUBJECT'
		}, {
			prop: nameof<InAppNotification>(x => x.trackingState),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.INAPP-NOTIFICATION-LISTING.FIELDS.TRACKING-STATE',
			pipe: this.pipeService.getPipe<NotificationInAppTrackingTypePipe>(NotificationInAppTrackingTypePipe)
		}, {
			prop: nameof<InAppNotification>(x => x.createdAt),
			sortable: true,
			languageName: 'NOTIFICATION-SERVICE.INAPP-NOTIFICATION-LISTING.FIELDS.CREATED-AT',
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
		}]);
	}

	onColumnsChanged(event: ColumnsChangedEvent) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<InAppNotification>(x => x.id),
				nameof<InAppNotification>(x => x.trackingState),
				...event.properties.filter(x => x).map(x => x.toString())
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	protected loadListing(): Observable<QueryResult<InAppNotification>> {
		return this.inappNotificationService.query(this.lookup);
	}

	togglePreviewMode(value: boolean) {
		this.isPreviewList = value;
		this.previewModeChange.emit(value);
	}
}
