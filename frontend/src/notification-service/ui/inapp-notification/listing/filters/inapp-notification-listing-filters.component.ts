import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationInAppTracking } from '@notification-service/core/enum/notification-inapp-tracking.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { InAppNotificationFilter } from '@notification-service/core/query/inapp-notification.lookup';

@Component({
	selector: 'app-inapp-notification-listing-filters',
	templateUrl: './inapp-notification-listing-filters.component.html',
	styleUrls: ['./inapp-notification-listing-filters.component.scss']
})
export class InAppNotificationListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: InAppNotificationFilter;
	@Output() filterChange = new EventEmitter<InAppNotificationFilter>();
	panelExpanded = false;
	trackingStates: NotificationInAppTracking[] = this.enumUtils.getEnumValues(NotificationInAppTracking);

	constructor(
		public enumUtils: NotificationServiceEnumUtils
	) { super(); }

	ngOnInit() {
		this.panelExpanded = !this.areHiddenFieldsEmpty();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['filter']) { this.panelExpanded = !this.areHiddenFieldsEmpty(); }
	}

	onFilterChange() {
		this.filterChange.emit(this.filter);
	}

	private areHiddenFieldsEmpty(): boolean {
		return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active));
	}

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
	get like(): string {
		return this.filter.like;
	}
	set like(value: string) {
		this.filter.like = value;
		this.filterChange.emit(this.filter);
	}

	get isActive(): boolean {
		return this.filter.isActive ? this.filter.isActive.includes(IsActive.Inactive) : true;
	}
	set isActive(value: boolean) {
		this.filter.isActive = value ? [IsActive.Active, IsActive.Inactive] : [IsActive.Active];
		this.filterChange.emit(this.filter);
	}

	get trackingState(): NotificationInAppTracking[] {
		return this.filter.trackingState ? this.filter.trackingState : null;
	}
	set trackingState(value: NotificationInAppTracking[]) {
		this.filter.trackingState = value && value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}
}
