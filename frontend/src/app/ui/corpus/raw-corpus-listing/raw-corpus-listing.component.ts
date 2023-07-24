import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { RawCorpus } from '@app/core/model/corpus/raw-corpus.model';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { RawCorpusService } from '@app/core/services/http/raw-corpus.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { FileExportDialogComponent } from '@app/ui/file/file-export-dialog/file-export-dialog.component';
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
import { RawCorpusPatchComponent } from '../raw-corpus-patch/raw-corpus-patch-modal.component';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { RenameDialogComponent } from '@app/ui/rename-dialog/rename-dialog.component';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';

@Component({
  selector: 'app-raw-corpus-listing',
  templateUrl: './raw-corpus-listing.component.html',
  styleUrls: ['./raw-corpus-listing.component.css']
})
export class RawCorpusListingComponent extends BaseListingComponent<RawCorpus, RawCorpusLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  filterEditorConfiguration: FilterEditorConfiguration = {
    items: [
      {
        key: 'createdAt',
        type: FilterEditorFilterType.DatePicker,
        label: 'APP.CORPUS-COMPONENT.RAW-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
      }
    ]
  };

  likeFilterFormGroup: FormGroup;
  filterFormGroup: FormGroup;

  @Output() onCorpusSelect = new EventEmitter<RawCorpus>();

  SelectionType = SelectionType;

  defaultSort = ["-download_date"];

  @ViewChild('listing') listingComponent: ListingComponent;

  protected loadListing(): Observable<QueryResult<RawCorpus>> {
    return this.rawCorpusService.query(this.lookup);
  }
  protected initializeLookup(): RawCorpusLookup {
    const lookup = new RawCorpusLookup();
    lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<RawCorpus>(x => x.download_date)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<RawCorpus>(x => x.id),
        nameof<RawCorpus>(x => x.name),
        nameof<RawCorpus>(x => x.description),
        nameof<RawCorpus>(x => x.visibility),
        nameof<RawCorpus>(x => x.download_date),
        nameof<RawCorpus>(x => x.records),
        nameof<RawCorpus>(x => x.schema),
        nameof<RawCorpus>(x => x.source)
			]
		};

    return lookup;
  }
  
  protected setupColumns() {
    this.gridColumns.push(...[
      {
        prop: nameof<RawCorpus>(x => x.name),
        sortable: true,
        resizeable: true,
        alwaysShown: true,
        languageName: 'APP.CORPUS-COMPONENT.NAME'
      },
      {
        prop: nameof<RawCorpus>(x => x.description),
        sortable: false,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.DESCRIPTION'
      },
      {
        prop: nameof<RawCorpus>(x => x.records),
        sortable: true,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.RAW.RECORDS'
      },
      {
        prop: nameof<RawCorpus>(x => x.source),
        sortable: false,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.RAW.SOURCE'
      },
      {
        prop: nameof<RawCorpus>(x => x.download_date),
        sortable: true,
        resizeable: true,
        languageName: 'APP.CORPUS-COMPONENT.RAW.DOWNLOAD-DATE',
        pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short')
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
    protected rawCorpusService: RawCorpusService,
    private pipeService: PipeService,
    private formBuilder: FormBuilder
  ) { 
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();

    setTimeout(() => {
      this.setupVisibleColumns([
        nameof<RawCorpus>(x => x.name),
        nameof<RawCorpus>(x => x.description),
        nameof<RawCorpus>(x => x.records),
        nameof<RawCorpus>(x => x.source),
        nameof<RawCorpus>(x => x.download_date)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpLikeFilterFormGroup();
    this._setUpFiltersFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refresh(): void{
    this.refreshWithoutReloading();
    this.listingComponent.onPageLoad({offset: 0} as PageLoadEvent);
  }

  public refreshWithoutReloading(): void {
    this.onCorpusSelect.emit(null);
  }

  public edit(corpus: RawCorpus, updateAll: boolean = false): void {
    if (updateAll) {
      this.dialog.open(RawCorpusPatchComponent,
        {
          width: "40rem",
          maxWidth: "90vw",
          disableClose: true,
          data: {
            corpus
          }
        }
      )
        .afterClosed()
        .pipe(
          filter(x => x),
          takeUntil(this._destroyed)
        )
        .subscribe(() => {
          this.snackbars.successfulUpdate();
          this.refresh();
        });
    } else {
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
          this.rawCorpusService.rename(rename, corpus.source).subscribe((_response) => {
            this.snackbars.successfulUpdate();
            this.refresh();
          });
        });
    }
  }

  public export(corpus: RawCorpus): void {
    let data = JSON.stringify(corpus);
    this.dialog.open(FileExportDialogComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data:{
        name: corpus.name,
        payload: data
      }
    });
  }

  private _setUpLikeFilterFormGroup(): void{
    this.likeFilterFormGroup = new FormGroup({
      like: new FormControl("")
    });
    this.likeFilterFormGroup.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(600)
    ).subscribe(filterChanges =>{
      this.lookup.like = filterChanges["like"];
      this.refresh();
    });
  }

  private _setUpFiltersFormGroup(): void{
    this.filterFormGroup = this.formBuilder.group(
      this.filterEditorConfiguration.items.reduce((aggr, current)=>({...aggr, [current.key]: null}),{})
    )
    this.filterFormGroup.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(600)
    ).subscribe(filterChanges =>{
      this.lookup = Object.assign(this.lookup, filterChanges);
      this.refresh();
    });
  }

  onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
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

}
