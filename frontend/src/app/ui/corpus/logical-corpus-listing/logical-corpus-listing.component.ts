import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CorpusValidFor } from '@app/core/enum/corpus-valid-for.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { FileExportDialogComponent } from '@app/ui/file/file-export-dialog/file-export-dialog.component';
import { RenameDialogComponent } from '@app/ui/rename-dialog/rename-dialog.component';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { ColumnSortEvent, ListingComponent, PageLoadEvent, RowActivateEvent, SortDirection } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { NewLogicalCorpusComponent } from './new-logical-corpus/new-logical-corpus.component';
import { DataTableLogicalCorpusValidForFormatPipe } from '@common/formatting/pipes/logical-corpus-valid-for.pipe';

@Component({
  selector: 'app-logical-corpus-listing',
  templateUrl: './logical-corpus-listing.component.html',
  styleUrls: ['./logical-corpus-listing.component.css']
})
export class LogicalCorpusListingComponent extends BaseListingComponent<LogicalCorpus, LogicalCorpusLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;
  availableValidFor: CorpusValidFor[];

  filterEditorConfiguration: FilterEditorConfiguration;
  likeFilterFormGroup: FormGroup;
  filterFormGroup: FormGroup;

  @Output()
  onCorpusSelect = new EventEmitter<LogicalCorpus>();

  SelectionType = SelectionType;

  defaultSort = ["-creation_date"];

  @ViewChild('listing') listingComponent: ListingComponent;

  protected loadListing(): Observable<QueryResult<LogicalCorpus>> {
    return this.logicalCorpusService.query(this.lookup);
  }
  protected initializeLookup(): LogicalCorpusLookup {
    const lookup = new LogicalCorpusLookup();
    lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<LogicalCorpus>(x => x.creation_date)] };
    this.updateOrderUiFields(lookup.order);

    lookup.project = {
      fields: [
        nameof<LogicalCorpus>(x => x.id),
        nameof<LogicalCorpus>(x => x.name),
        nameof<LogicalCorpus>(x => x.description),
        nameof<LogicalCorpus>(x => x.visibility),
        nameof<LogicalCorpus>(x => x.creator),
        nameof<LogicalCorpus>(x => x.creation_date),
        nameof<LogicalCorpus>(x => x.valid_for),
        nameof<LogicalCorpus>(x => x.Dtsets)
      ]
    };

    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(...[
      {
        prop: nameof<LogicalCorpus>(x => x.name),
        sortable: true,
        resizeable: true,
        alwaysShown: true,
        languageName: 'APP.CORPUS-COMPONENT.NAME'
      },
      {
        prop: nameof<LogicalCorpus>(x => x.description),
        sortable: false,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.DESCRIPTION'
      },
      {
        prop: nameof<LogicalCorpus>(x => x.creator),
        sortable: true,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.LOGICAL.CREATOR'
      },
      {
        prop: nameof<LogicalCorpus>(x => x.creation_date),
        sortable: true,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.LOGICAL.CREATION-DATE',
        pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
      },
      {
        prop: nameof<LogicalCorpus>(x => x.valid_for),
        sortable: true,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.LOGICAL.VALID-FOR',
        pipe: this.pipeService.getPipe<DataTableLogicalCorpusValidForFormatPipe>(DataTableLogicalCorpusValidForFormatPipe)
      }
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
    protected logicalCorpusService: LogicalCorpusService,
    private pipeService: PipeService,
    private formBuilder: FormBuilder
  ) {
    super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
    this.lookup = this.initializeLookup();
    this.availableValidFor = this.enumUtils.getEnumValues<CorpusValidFor>(CorpusValidFor);
    this._buildFilterEditorConfiguration();

    setTimeout(() => {
      this.setupVisibleColumns([
        nameof<LogicalCorpus>(x => x.name),
        nameof<LogicalCorpus>(x => x.description),
        nameof<LogicalCorpus>(x => x.creation_date),
        nameof<LogicalCorpus>(X => X.valid_for)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpLikeFilterFormGroup();
    this._setUpFiltersFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refresh(): void {
    this.refreshWithoutReloading();
    this.listingComponent.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refreshWithoutReloading(): void {
    this.onCorpusSelect.emit(null);
  }

  public edit(corpus: LogicalCorpus): void {
    this.dialog.open(RenameDialogComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: corpus.name,
        title: this.language.instant('APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.RENAME-DIALOG.TITLE')
      }
    })
      .afterClosed()
      .pipe(
        filter(x => x),
        takeUntil(this._destroyed)
      )
      .subscribe((rename: RenamePersist) => {
        this.logicalCorpusService.rename(rename).subscribe((_response) => {
          this.snackbars.successfulUpdate();
          this.refresh();
        });
      });
  }

  private _buildFilterEditorConfiguration(): void {
    this.filterEditorConfiguration = {
      items: [
        {
          key: 'createdAt',
          type: FilterEditorFilterType.DatePicker,
          label: 'APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
        },
        {
          key: 'creator',
          type: FilterEditorFilterType.TextInput,
          placeholder: 'APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
        },
        {
          key: 'corpusValidFor',
          type: FilterEditorFilterType.Select,
          label: 'APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.VALID-FOR',
          availableValues: this.availableValidFor.map(type => ({ label: () => this.enumUtils.toCorpusValidForString(type), value: type.toString() }))
        },
        {
          key: 'mine',
          type: FilterEditorFilterType.Checkbox,
          label: 'APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
        },
      ]
    };
  }

  public export(corpus: LogicalCorpus): void {
    let data = JSON.stringify(corpus);
    this.dialog.open(FileExportDialogComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: corpus.name,
        payload: data
      }
    });
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
    )
    this.filterFormGroup.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(600)
    ).subscribe(filterChanges => {
      this.lookup = Object.assign(this.lookup, filterChanges);
      this.refresh();
    });
    this.filterFormGroup.patchValue({ corpusValidFor: "ALL" }, { emitEvent: null });
  }

  onRowActivated($event: RowActivateEvent) {
    if ($event.type === 'click') {
      this.onCorpusSelect.emit($event.row);
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

  addNewCorpusManually(): void {
    this.dialog.open(NewLogicalCorpusComponent, {
      width: "50rem",
      maxWidth: "90vw",
      disableClose: true
    })
      .afterClosed()
      .pipe(
        filter(x => x),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        this.onCorpusSelect.emit(null);
        this.snackbars.successfulCreation();
        this.refresh();
      });
  }

  // addNewCorpusFromFile(): void {
  //   this.dialog.open(NewLogicalCorpusFromFileComponent, {
  //     width: "50rem",
  //     maxWidth: "90vw",
  //     disableClose: true
  //   })
  //   .afterClosed()
  //   .pipe(
  //     filter(x => x),
  //     takeUntil(this._destroyed)
  //   )
  //   .subscribe(() => {
  //     this.onCorpusSelect.emit(null);
  //     this.snackbars.successfulCreation();
  //     this.refresh();
  //   });
  // }
}
