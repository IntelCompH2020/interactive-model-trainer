import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { BaseComponent } from '@common/base/base.component';
import { UserServiceEnumUtils } from '@user-service/core/formatting/enum-utils.service';
import { UserFilter } from '@user-service/core/query/user.lookup';

@Component({
	selector: 'app-user-listing-filters',
	templateUrl: './user-listing-filters.component.html',
	styleUrls: ['./user-listing-filters.component.scss']
})
export class UserListingFiltersComponent extends BaseComponent implements OnInit, OnChanges {

	@Input() filter: UserFilter;
	@Output() filterChange = new EventEmitter<UserFilter>();
	panelExpanded = false;

	constructor(
		public enumUtils: UserServiceEnumUtils
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
			;
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
}
