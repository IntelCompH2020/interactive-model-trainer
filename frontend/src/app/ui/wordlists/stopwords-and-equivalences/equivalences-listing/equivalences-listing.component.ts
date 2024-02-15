import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { EquivalenceLookup } from '@app/core/query/equivalence.lookup';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { ColumnSortEvent, ListingComponent, PageLoadEvent, RowActivateEvent, SortDirection } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { Observable } from 'rxjs';
import { nameof } from 'ts-simple-nameof';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { NewEquivalenceFromFileComponent } from './new-equivalence-from-file/new-equivalence-from-file.component';
import { NewEquivalenceManuallyComponent } from './new-equivalence-manually/new-equivalence-manually.component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { RenameDialogComponent } from '@app/ui/rename-dialog/rename-dialog.component';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { MergeWordlistsDialogComponent } from '../../merge-wordlists-dialog/merge-wordlists-dialog.component';
import { WordListType } from '@app/core/model/wordlist/wordlist.model';
@Component({
	selector: 'app-equivalences-listing',
	templateUrl: './equivalences-listing.component.html',
	styleUrls: ['./equivalences-listing.component.css']
})
export class EquivalencesListingComponent extends BaseListingComponent<Equivalence, EquivalenceLookup> implements OnInit {
	userSettingsKey: UserSettingsKey;

	filterEditorConfiguration: FilterEditorConfiguration = {
		items: [
			{
				key: 'createdAt',
				type: FilterEditorFilterType.DatePicker,
				label: 'APP.WORD-LIST-COMPONENT.EQUIVALENCES-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
			},
			{
				key: 'creator',
				type: FilterEditorFilterType.TextInput,
				placeholder: 'APP.WORD-LIST-COMPONENT.EQUIVALENCES-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
			},
			{
				key: 'mine',
				type: FilterEditorFilterType.Checkbox,
				label: 'APP.WORD-LIST-COMPONENT.EQUIVALENCES-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
			},
		]
	};

	likeFilterFormGroup: FormGroup;
	filterFormGroup: FormGroup;

	@Output()
	onEquivalenceSelect = new EventEmitter<Equivalence>();

	SelectionType = SelectionType;

	defaultSort = ["-creation_date"];

	get limit(): number {
    return Math.max(this.gridRows.length, this.ITEMS_PER_PAGE);
  }

  get count(): number {
    return this.totalElements;
  }

	@ViewChild('listing') listingComponent: ListingComponent;

	protected loadListing(): Observable<QueryResult<Equivalence>> {
		return this.equivalenceService.query(this.lookup);
	}
	protected initializeLookup(): RawCorpusLookup {
		const lookup = new RawCorpusLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<Equivalence>(x => x.creation_date)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
      fields: [
        nameof<Equivalence>(x => x.id),
        nameof<Equivalence>(x => x.name),
        nameof<Equivalence>(x => x.description),
        nameof<Equivalence>(x => x.wordlist),
        nameof<Equivalence>(x => x.location),
        nameof<Equivalence>(x => x.creator),
        nameof<Equivalence>(x => x.visibility),
        nameof<Equivalence>(x => x.creation_date),
      ]
    };

		return lookup;
	}
	protected setupColumns() {
		this.gridColumns.push(...[
			{
				prop: nameof<Equivalence>(x => x.name),
				sortable: true,
				resizeable: true,
				alwaysShown: true,
				languageName: 'APP.WORD-LIST-COMPONENT.NAME'
			},
			{
        prop: nameof<Equivalence>(x => x.description),
        sortable: false,
				resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.DESCRIPTION'
      },
			{
				prop: nameof<Equivalence>(x => x.creation_date),
				pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
				sortable: true,
				resizeable: true,
				languageName: 'APP.WORD-LIST-COMPONENT.CREATION-DATE'
			},
			{
				prop: nameof<Equivalence>(x => x.creator),
				sortable: true,
				resizeable: true,
				languageName: 'APP.WORD-LIST-COMPONENT.CREATOR'
			},
			{
				prop: nameof<Equivalence>(x => x.location),
				sortable: false,
				resizeable: true,
				languageName: 'APP.WORD-LIST-COMPONENT.LOCATION'
			},
		]);
	}

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected uiNotificationService: UiNotificationService,
		protected snackbars: SnackBarCommonNotificationsService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		protected language: TranslateService,
		public authService: AuthService,
		public enumUtils: AppEnumUtils,
		protected dialog: MatDialog,
		protected equivalenceService: EquivalenceService,
		private pipeService: PipeService,
		private formBuilder: FormBuilder
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();
		
		setTimeout(() => {
      this.setupVisibleColumns([
        nameof<Equivalence>(x => x.name),
        nameof<Equivalence>(x => x.description),
        nameof<Equivalence>(x => x.creation_date),
        nameof<Equivalence>(x => x.location)
      ]);
    }, 0);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this._setUpLikeFilterFormGroup();
		this._setUpFiltersFormGroup();
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	private _setUpLikeFilterFormGroup(): void {
		this.likeFilterFormGroup = new FormGroup({
			like: new FormControl("")
		});
		this.likeFilterFormGroup.valueChanges.pipe(
			takeUntil(this._destroyed),
			debounceTime(600)
		).subscribe(filterChanges => {
			this.lookup.like = filterChanges["like"];
			this.refresh();
		});
	}

	private _setUpFiltersFormGroup(): void {
		this.filterFormGroup = this.formBuilder.group(
			this.filterEditorConfiguration.items.reduce((aggr, current) => ({ ...aggr, [current.key]: null }), {})
		);
		this.filterFormGroup.valueChanges.pipe(
			takeUntil(this._destroyed),
			debounceTime(600)
		).subscribe(filterChanges => {
			this.lookup = Object.assign(this.lookup, filterChanges);
			this.refresh();
		});
	}

	onRowActivated($event: RowActivateEvent) {
		if ($event.type === 'click') {
			this.onEquivalenceSelect.emit($event.row);
		}
	}

	alterPage(event: PageLoadEvent) {
    this.refreshWithoutReloading();
    if (event) {
      this.lookup.page.offset = event.offset * this.lookup.page.size;
      this.onPageLoad({ offset: event.offset } as PageLoadEvent);
    } else {
      this.lookup.page.offset = 0;
      this.onPageLoad({ offset: 0 } as PageLoadEvent);
    }
  }

	onColumnSort(event: ColumnSortEvent) {
    this.refreshWithoutReloading();
		const sortItems = event.sortDescriptors.map(x => (x.direction === SortDirection.Ascending ? '' : '-') + x.property);
		this.lookup.order = { items: sortItems };
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	addNewEquivalenceFromFile(): void {
		this.dialog.open(NewEquivalenceFromFileComponent, {
			width: "50rem",
			maxWidth: "90vw",
			disableClose: true,
		})
		.afterClosed()
		.pipe(
			filter(x => x),
			takeUntil(this._destroyed),
		)
		.subscribe(() => {
			this.onEquivalenceSelect.emit(null);
			this.snackbars.successfulCreation();
			this.refresh();
		});
	}
	addNewEquivalenceManually(): void {
		this.dialog.open(NewEquivalenceManuallyComponent, {
			width: "60rem",
			maxWidth: "90vw",
			disableClose: true,
		})
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed),
			)
			.subscribe(() => {
				this.onEquivalenceSelect.emit(null);
				this.snackbars.successfulCreation();
				this.refresh();
			});
	}

	addNewEquivalenceMerge(): void {
    this.dialog.open(MergeWordlistsDialogComponent, {
      width: "60rem",
      maxWidth: "90vw",
      disableClose: true,
      data: {
        wordlistType: WordListType.Equivalence
      }
    })
      .afterClosed()
      .pipe(
        filter(x => x),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        this.onEquivalenceSelect.emit(null);
        this.snackbars.successfulCreation();
        this.refresh();
      });
  }

	public refresh(): void {
		this.refreshWithoutReloading();
		this.listingComponent.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	public refreshWithoutReloading(): void {
		this.onEquivalenceSelect.emit(null);
	}

	public edit(equivalence: Equivalence, updateAll: boolean = false): void {
		if (updateAll) {
			this.dialog.open(NewEquivalenceManuallyComponent, {
				width: "60rem",
				maxWidth: "90vw",
				data: {
					equivalence
				},
				disableClose: true,
			})
				.afterClosed()
				.pipe(
					filter(x => x),
					takeUntil(this._destroyed),
				)
				.subscribe(() => {
					this.onEquivalenceSelect.emit(null);
					this.snackbars.successfulCreation();
					this.refresh();
				});
		} else {
			this.dialog.open(RenameDialogComponent, {
        width: '25rem',
        maxWidth: "90vw",
        disableClose: true,
        data: {
          name: equivalence.name,
          title: this.language.instant('APP.WORD-LIST-COMPONENT.EQUIVALENCES-LISTING-COMPONENT.RENAME-DIALOG.TITLE')
        }
      })
        .afterClosed()
        .pipe(
          filter(x => x),
          takeUntil(this._destroyed)
        )
        .subscribe((rename: RenamePersist) => {
          this.equivalenceService.rename(rename).subscribe((_response) => {
            this.onEquivalenceSelect.emit(null);
            this.snackbars.successfulUpdate();
            this.refresh();
          });
        });
		}
	}

	public copy(equivalence: Equivalence) {
		this.equivalenceService.copy(equivalence.name).subscribe(
			(_response) => this.refresh()
		);
	}
}
