import { Component, EventEmitter, Input, OnChanges, OnInit, Output, PipeTransform, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CollectionUtils } from '@common/utilities/collection-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { ListingSettingsDialogComponent } from '@common/modules/listing/listing-settings/listing-settings-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-listing',
	templateUrl: './listing.component.html',
	styleUrls: ['./listing.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ListingComponent extends BaseComponent implements OnInit, OnChanges {

	@ViewChild('functionValueTemplate', { static: true }) functionValueTemplate: TemplateRef<any>;


	selected = [];


	@Input()
	selectionType;

	@Input() class: TableClass = TableClass.Material;
	@Input() columns: ColumnDefinition[];
	@Input() rows: any[];
	@Input() columnMode: ColumnMode = ColumnMode.Force;
	@Input() headerHeight = 50;
	@Input() footerHeight = 50;
	@Input() rowHeight: number | string = 'auto';
	@Input() messages: StaticTableMessages;
	@Input() externalPaging = true;
	@Input() count = 0;
	@Input() offset = 0;
	@Input() limit: number = undefined;
	@Input() treeFromRelation: string;
	@Input() treeToRelation: string;
	public _defaultSort: any;
	@Input() set defaultSort(input: string[]) {
		if (input && input.length > 0) {
			this._defaultSort = input.map(x => {
				let sortProp: String = x;
				let sortDir: String = SortDirection.Ascending;
				if (x.startsWith('+')) {
					sortProp = x.substring(1);
					sortDir = SortDirection.Ascending;
				} else if (x.startsWith('-')) {
					sortProp = x.substring(1);
					sortDir = SortDirection.Descending;
				}
				return { prop: sortProp, dir: sortDir };
			});
		} else {
			this._defaultSort = undefined;
		}
	}
	@Input() loadingIndicator = false;
	@Input() externalSorting = false;

	@Output() rowActivated: EventEmitter<RowActivateEvent> = new EventEmitter<RowActivateEvent>();
	@Output() pageLoad: EventEmitter<PageLoadEvent> = new EventEmitter<PageLoadEvent>();
	@Output() columnSort: EventEmitter<ColumnSortEvent> = new EventEmitter<ColumnSortEvent>();
	@Output() columnsChanged: EventEmitter<ColumnsChangedEvent> = new EventEmitter<ColumnsChangedEvent>();
	@Output() treeAction: EventEmitter<any> = new EventEmitter<any>();

	public internalColumns: TableColumn[];
	@Input() visibleColumns: TableColumnProp[];
	private columnSortKeys: Map<TableColumnProp, string[]>;

	constructor(
		private collectionUtils: CollectionUtils,
		private language: TranslateService,
		private dialog: MatDialog) {
		super();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['columns']) {
			this.refreshColumnDefinitionData();
		}
		if (changes['visibleColumns'] && !changes['visibleColumns'].isFirstChange()) {
			this.refreshColumnDefinitionData();
		}
	}

	ngOnInit() {
		this.setTableMessages();

		this.language.onLangChange.pipe(takeUntil(this._destroyed)).subscribe(event => {
			this.setTableMessages();
			this.refreshColumnDefinitionData();
		});

	}

	private setTableMessages() {
		this.messages = {
			emptyMessage: this.language.instant('COMMONS.LISTING-COMPONENT.MESSAGE.EMPTY'),
			totalMessage: this.language.instant('COMMONS.LISTING-COMPONENT.MESSAGE.TOTAL'),
			selectedMessage: this.language.instant('COMMONS.LISTING-COMPONENT.MESSAGE.SELECTED')
		};
	}

	private refreshColumnDefinitionData() {
		const visibleColumns = this.getVisibleColumns();
		this.internalColumns = this.columns.filter(x => x.alwaysShown || visibleColumns.includes(x.prop)).map(x => {
			const item = {
				checkboxable: x.checkboxable,
				frozenLeft: x.frozenLeft,
				frozenRight: x.frozenRight,
				flexGrow: x.flexGrow,
				minWidth: x.minWidth,
				maxWidth: x.maxWidth,
				width: x.width,
				resizeable: x.resizeable,
				comparator: x.comparator,
				pipe: x.pipe,
				sortable: x.sortable,
				draggable: x.draggable,
				canAutoResize: x.canAutoResize,
				name: x.languageName ? this.language.instant(x.languageName) : x.name,
				prop: x.prop,
				cellTemplate: x.cellTemplate,
				headerTemplate: x.headerTemplate,
				cellClass: x.cellClass,
				headerClass: x.headerClass,
				headerCheckboxable: x.headerCheckboxable,
				summaryFunc: x.summaryFunc,
				summaryTemplate: x.summaryTemplate,
				isTreeColumn: x.isTreeColumn,
				treeLevelIndent: x.treeLevelIndent
			} as TableColumn;

			if (x.valueFunction) {
				item.cellTemplate = this.functionValueTemplate;
				item['valueFunction'] = x.valueFunction;
			}
			return item;
		});
		this.columnSortKeys = new Map<TableColumnProp, string[]>(this.columns.map(buildColumnSortKeys));
	}

	onPageLoad(event) {
		if (this.pageLoad && event) {
			this.pageLoad.emit({
				count: event.count,
				pageSize: event.pageSize,
				limit: event.limit,
				offset: event.offset,
			});
		}
	}

	onRowActivated(event) {
		if (this.rowActivated && event) {
			this.rowActivated.emit({
				type: event.type,
				event: event.event,
				row: event.row,
				column: event.column,
				value: event.value,
				cellElement: event.cellElement,
				rowElement: event.rowElement,
			});
		}
	}

	onColumnSort(event) {
		if (this.columnSort && event) {
			const sortDescriptorsCollection: SortDescriptor[][] = event.sorts.map(x => getColumnSortDescriptors(x, this.columnSortKeys.get(x.prop)));
			const sortEvent = {
				column: event.column,
				previousValue: event.prevValue,
				newValue: event.newValue,
				sortDescriptors: this.collectionUtils.flatten(sortDescriptorsCollection)
			};
			this.columnSort.emit(sortEvent);
		}
	}

	onTreeAction(event: any) {
		const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.rows = [...this.rows];
		this.treeAction.emit(event);
	}

	onListingSettingsButtonClicked() {
		let dialogRef;
		dialogRef = this.dialog.open(ListingSettingsDialogComponent, {
			data: { availableColumns: this.columns.filter(x => !x.alwaysShown), visibleColumns: this.getVisibleColumns() }
		});

		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (!result) { return; }
			this.visibleColumns = result.visibleColumns;
			this.refreshColumnDefinitionData();
			if (this.columnsChanged) {
				this.columnsChanged.emit({
					properties: this.getVisibleColumns()
				});
			}
		});
	}

	getVisibleColumns(): TableColumnProp[] {
		if (!this.visibleColumns || this.visibleColumns.length === 0) { return this.columns.map(x => x.prop); }
		return this.visibleColumns;
	}
}


export enum TableClass {
	Material = 'material',
	Bootstrap = 'bootstrap',
	Dark = 'dark'
}

export enum ColumnMode {
	Standard = 'standard',
	Flex = 'flex',
	Force = 'force'
}

export interface RowActivateEvent {
	type: 'keydown' | 'click' | 'dblclick' | 'mouseenter';
	event: MouseEvent;
	row: any;
	column: ColumnDefinition;
	value: any;
	cellElement: Element;
	rowElement: Element;
}

export interface PageLoadEvent {
	count: number;
	pageSize: number;
	limit: number;
	offset: number;
}

export interface ColumnSortEvent {
	sortDescriptors: SortDescriptor[];
	column: ColumnDefinition;
	previousValue: SortDirection;
	newValue: SortDirection;
}

export interface ColumnsChangedEvent {
	properties: TableColumnProp[];
}

export interface SortDescriptor {
	direction: SortDirection;
	property: string;
}

export enum SortDirection {
	Ascending = 'asc',
	Descending = 'desc'
}


export declare type TableColumnProp = string | number;
export interface ColumnDefinition {
	/**
     * Determines if column is checkbox
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	checkboxable?: boolean;
	/**
     * Determines if the column is frozen to the left
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	frozenLeft?: boolean;
	/**
     * Determines if the column is frozen to the right
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	frozenRight?: boolean;
	/**
     * The grow factor relative to other columns. Same as the flex-grow
     * API from http =//www.w3.org/TR/css3-flexbox/. Basically;
     * take any available extra width and distribute it proportionally
     * according to all columns' flexGrow values.
     *
     * @type {number}
     * @memberOf TableColumn
     */
	flexGrow?: number;
	/**
     * Min width of the column
     *
     * @type {number}
     * @memberOf TableColumn
     */
	minWidth?: number;
	/**
     * Max width of the column
     *
     * @type {number}
     * @memberOf TableColumn
     */
	maxWidth?: number;
	/**
     * The default width of the column, in pixels
     *
     * @type {number}
     * @memberOf TableColumn
     */
	width?: number;
	/**
     * Can the column be resized
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	resizeable?: boolean;
	/**
     * Custom sort comparator
     *
     * @type {*}
     * @memberOf TableColumn
     */
	comparator?: any;
	/**
     * Custom pipe transforms
     *
     * @type {PipeTransform}
     * @memberOf TableColumn
     */
	pipe?: PipeTransform;
	/**
     * Can the column be sorted
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	sortable?: boolean;
	/**
     * Can the column be re-arranged by dragging
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	/**
     * Override for the sort property that will be used (default is column.prop)
     *
     * @type {string}
     * @memberOf TableColumn
     */
	sortKeys?: string[];
	draggable?: boolean;
	/**
     * Whether the column can automatically resize to fill space in the table.
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	canAutoResize?: boolean;
	/**
     * Column name or label
     *
     * @type {string}
     * @memberOf TableColumn
     */
	name?: string;
	/**
     * Language Key Column name or label
     *
     * @type {string}
     * @memberOf TableColumn
     */
	languageName?: string;
	/**
     * Property to bind to the row. Example:
     *
     * `someField` or `some.field.nested`, 0 (numeric)
     *
     * If left blank, will use the name as camel case conversion
     *
     * @type {TableColumnProp}
     * @memberOf TableColumn
     */
	prop?: TableColumnProp;
	/**
     * Cell template ref
     *
     * @type {*}
     * @memberOf TableColumn
     */
	cellTemplate?: any;
	/**
     * Header template ref
     *
     * @type {*}
     * @memberOf TableColumn
     */
	headerTemplate?: any;
	/**
     * CSS Classes for the cell
     *
     *
     * @memberOf TableColumn
     */
	cellClass?: string | ((data: any) => string | any);
	/**
     * CSS classes for the header
     *
     *
     * @memberOf TableColumn
     */
	headerClass?: string | ((data: any) => string | any);
	/**
     * Header checkbox enabled
     *
     * @type {boolean}
     * @memberOf TableColumn
     */
	headerCheckboxable?: boolean;
	/**
     * Summary function
     *
     * @type {(cells: any[]) => any}
     * @memberOf TableColumn
     */
	summaryFunc?: (cells: any[]) => any;
	/**
     * Summary cell template ref
     *
     * @type {*}
     * @memberOf TableColumn
     */
	summaryTemplate?: any;
	alwaysShown?: boolean;
	valueFunction?: (cell: any) => any;
	isTreeColumn?: boolean;
	treeLevelIndent?: number;
}
export interface StaticTableMessages {
	emptyMessage: string;
	totalMessage: string;
	selectedMessage: string;
}

function getColumnSortDescriptors(internalSortDescriptor, sortKeys: string[]): SortDescriptor[] {
	const direction = internalSortDescriptor.dir;
	return sortKeys.map(x => ({
		direction: direction,
		property: x
	}));
}

function buildColumnSortKeys(column: ColumnDefinition): [TableColumnProp, string[]] {
	return [column.prop, getColumnSortKeys(column)];
}

function getColumnSortKeys(column: ColumnDefinition): string[] {
	const sortKeys = extractSortKeys(column.sortKeys);
	if (sortKeys.length === 0) { sortKeys.push(String(column.prop)); }
	return sortKeys;
}

function extractSortKeys(sortKeys: string[]): string[] {
	sortKeys = sortKeys || [];
	return sortKeys.filter(x => Boolean(x));
}
