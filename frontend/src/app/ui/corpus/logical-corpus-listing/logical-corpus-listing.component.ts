import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { FileExportDialogComponent } from '@app/ui/file/file-export-dialog.component';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { Observable} from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { NewLogicalCorpusFromFileComponent } from './new-logical-corpus-from-file/new-logical-corpus-from-file.component';
import { NewLogicalCorpusComponent } from './new-logical-corpus/new-logical-corpus.component';
import { RenameLogicalCorpusComponent } from './rename-logical-corpus/rename-logical-corpus.component';

@Component({
  selector: 'app-logical-corpus-listing',
  templateUrl: './logical-corpus-listing.component.html',
  styleUrls: ['./logical-corpus-listing.component.css']
})
export class LogicalCorpusListingComponent extends BaseListingComponent<LogicalCorpus, LogicalCorpusLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;
  filterEditorConfiguration: FilterEditorConfiguration = {
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
        key: 'mine',
        type: FilterEditorFilterType.Checkbox,
        label: 'APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
      },
    ]
  };

  likeFilterFormGroup: FormGroup;
  filterFormGroup: FormGroup;

  @Output()
  onCorpusSelect = new EventEmitter<LogicalCorpus>();

  SelectionType = SelectionType;

  protected loadListing(): Observable<QueryResult<LogicalCorpus>> {
    return this.logicalCorpusService.query(this.lookup);
  }
  protected initializeLookup(): LogicalCorpusLookup {
    const lookup =  new LogicalCorpusLookup();
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
        nameof<LogicalCorpus>(x => x.creation_date),
        nameof<LogicalCorpus>(x => x.valid_for),
        nameof<LogicalCorpus>(x => x.dtsets)
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
        languageName: 'APP.CORPUS-COMPONENT.NAME'
      },
      {
        prop: nameof<LogicalCorpus>(x => x.description),
        sortable: true,
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
    private formBuilder: FormBuilder,
    private modelSelectionService: ModelSelectionService
  ) { 
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpLikeFilterFormGroup();
    this._setUpFiltersFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refresh(): void{
    this.onCorpusSelect.emit(null);
    this.modelSelectionService.corpus = "";
    this.onPageLoad({offset: 0} as PageLoadEvent);
  }

  public edit(corpus: LogicalCorpus): void{
    this.dialog.open(RenameLogicalCorpusComponent, {
      width: '25rem',
      disableClose: true,
      data:{
        corpus
      }
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed)
    )
    .subscribe(() => {
      this.snackbars.successfulUpdate();
      this.refresh();
    });
  }

  public export(corpus: LogicalCorpus): void {
    let data = JSON.stringify(corpus);
    this.dialog.open(FileExportDialogComponent, {
      width: '25rem',
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

  onColumnsChanged(event: ColumnsChangedEvent) {
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<LogicalCorpus>(x => x.id),
        nameof<LogicalCorpus>(x => x.visibility),
        nameof<LogicalCorpus>(x => x.dtsets),
        nameof<LogicalCorpus>(x => x.valid_for),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

  onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
      this.onCorpusSelect.emit($event.row);
      this.modelSelectionService.corpus = ($event.row as LogicalCorpus).name;
    }
  }

  addNewCorpusManually(): void {
    this.dialog.open(NewLogicalCorpusComponent, {
      minWidth: '50rem',
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

  addNewCorpusFromFile(): void {
    this.dialog.open(NewLogicalCorpusFromFileComponent, {
      minWidth: '40rem',
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
}
