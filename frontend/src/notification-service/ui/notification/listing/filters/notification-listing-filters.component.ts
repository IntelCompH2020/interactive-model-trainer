import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { MultipleAutoCompleteConfiguration } from '@common/modules/auto-complete/multiple/multiple-auto-complete-configuration';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { Guid } from '@common/types/guid';
import { ContactType } from '@notification-service/core/enum/contact-type.enum';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationNotifyState } from '@notification-service/core/enum/notification-notify-state.enum';
import { NotificationTrackingProcess } from '@notification-service/core/enum/notification-tracking-process.enum';
import { NotificationTrackingState } from '@notification-service/core/enum/notification-tracking-state.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { NotificationFilter } from '@notification-service/core/query/notification.lookup';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { UserLookup } from '@user-service/core/query/user.lookup';
import { UserService } from '@user-service/services/http/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-notification-listing-filters',
	templateUrl: './notification-listing-filters.component.html',
	styleUrls: ['./notification-listing-filters.component.scss']
})
export class NotificationListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: NotificationFilter;
	@Output() filterChange = new EventEmitter<NotificationFilter>();
	panelExpanded = false;
	notificationTypeEnumValues: NotificationType[] = this.enumUtils.getEnumValues(NotificationType);
	contactTypeEnumValues: ContactType[] = this.enumUtils.getEnumValues(ContactType);
	notifyStateEnumValues: NotificationNotifyState[] = this.enumUtils.getEnumValues(NotificationNotifyState);
	trackingStateEnumValues: NotificationTrackingState[] = this.enumUtils.getEnumValues(NotificationTrackingState);
	trackingProcessEnumValues: NotificationTrackingProcess[] = this.enumUtils.getEnumValues(NotificationTrackingProcess);

	userMultipleAutocompleteConfiguration: MultipleAutoCompleteConfiguration = {
		initialItems: this.initialUserItems.bind(this),
		filterFn: this.userFilterFn.bind(this),
		displayFn: (item: UserServiceUser) => item.name,
		titleFn: (item: UserServiceUser) => item.name
	};

	constructor(
		public enumUtils: NotificationServiceEnumUtils,
		private userService: UserService,
		private filterService: FilterService
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
		return (!this.filter.isActive || this.filter.isActive.length === 0 || (this.filter.isActive.length === 1 && this.filter.isActive[0] === IsActive.Active))
			&& (!this.filter.userIds || this.filter.userIds.length === 0)
			&& (!this.filter.type || this.filter.type.length === 0)
			&& (!this.filter.contactType || this.filter.contactType.length === 0)
			&& (!this.filter.state || this.filter.state.length === 0)
			&& (!this.filter.trackingState || this.filter.trackingState.length === 0)
			&& (!this.filter.trackingProcess || this.filter.trackingProcess.length === 0);
	}

	//
	// Filter getters / setters
	// Implement here any custom logic regarding how these fields are applied to the lookup.
	//
	get isActive(): boolean {
		return this.filter.isActive ? this.filter.isActive.includes(IsActive.Inactive) : true;
	}
	set isActive(value: boolean) {
		this.filter.isActive = value ? [IsActive.Active, IsActive.Inactive] : [IsActive.Active];
		this.filterChange.emit(this.filter);
	}

	get users(): UserServiceUser[] {
		return null;
	}
	set users(value: UserServiceUser[]) {
		this.filter.userIds = value ? value.map(x => x.id) : null;
		this.filterChange.emit(this.filter);
	}

	get type(): NotificationType[] {
		return this.filter.type;
	}
	set type(value: NotificationType[]) {
		this.filter.type = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	get contactType(): ContactType[] {
		return this.filter.contactType;
	}
	set contactType(value: ContactType[]) {
		this.filter.contactType = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	get state(): NotificationNotifyState[] {
		return this.filter.state;
	}
	set state(value: NotificationNotifyState[]) {
		this.filter.state = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	get trackingState(): NotificationTrackingState[] {
		return this.filter.trackingState;
	}
	set trackingState(value: NotificationTrackingState[]) {
		this.filter.trackingState = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	get trackingProcess(): NotificationTrackingProcess[] {
		return this.filter.trackingProcess;
	}
	set trackingProcess(value: NotificationTrackingProcess[]) {
		this.filter.trackingProcess = value.length > 0 ? value : null;
		this.filterChange.emit(this.filter);
	}

	private buildUserLookup(like?: string, excludedIds?: Guid[]): UserLookup {
		const lookup: UserLookup = new UserLookup();
		if (excludedIds && excludedIds.length > 0) { lookup.excludedIds = excludedIds; }
		lookup.isActive = [IsActive.Active];
		lookup.project = {
			fields: [
				nameof<UserServiceUser>(x => x.id),
				nameof<UserServiceUser>(x => x.name)
			]
		};
		if (like) { lookup.like = this.filterService.transformLike(like); }
		return lookup;
	}

	private initialUserItems(selectedItems?: UserServiceUser[]): Observable<UserServiceUser[]> {
		return this.userService.query(this.buildUserLookup(null, selectedItems ? selectedItems.map(x => x.id) : null)).pipe(map(x => x.items));
	}

	private userFilterFn(searchQuery: string, selectedItems?: UserServiceUser[]): Observable<UserServiceUser[]> {
		return this.userService.query(this.buildUserLookup(searchQuery, selectedItems ? selectedItems.map(x => x.id) : null)).pipe(map(x => x.items));
	}
}
