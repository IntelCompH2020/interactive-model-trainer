import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { StopwordLookup } from '@app/core/query/stopword.lookup';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
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
import { Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { NewStopwordFromFileComponent } from './new-stopword-from-file/new-stopword-from-file.component';
import { NewStopwordManuallyComponent } from './new-stopword-manually/new-stopword-manually.component';
import { RenameStopwordComponent } from './rename-stopword/rename-stopword.component';

@Component({
  selector: 'app-stopwords-listing',
  templateUrl: './stopwords-listing.component.html',
  styleUrls: ['./stopwords-listing.component.css']
})
export class StopwordsListingComponent extends BaseListingComponent<Stopword, StopwordLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  filterEditorConfiguration: FilterEditorConfiguration = {
    items: [
      {
        key: 'creation_date',
        type: FilterEditorFilterType.DatePicker,
        label: 'APP.WORD-LIST-COMPONENT.STOPWORDS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
      },
      {
        key: 'creator',
        type: FilterEditorFilterType.TextInput,
        placeholder: 'APP.WORD-LIST-COMPONENT.STOPWORDS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
      },
      {
        key: 'mine',
        type: FilterEditorFilterType.Checkbox,
        label: 'APP.WORD-LIST-COMPONENT.STOPWORDS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
      },
    ]
  };
  filterFormGroup: FormGroup;
  likeFilterFormGroup: FormGroup;

  @Output()
  onStopwordSelect = new EventEmitter<Stopword>();

  SelectionType = SelectionType;

  protected loadListing(): Observable<QueryResult<Stopword>> {
    return this.stopwordService.query(this.lookup);
  }
  protected initializeLookup(): RawCorpusLookup {
    const lookup =  new RawCorpusLookup();
    lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<Stopword>(x => x.createdAt)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
        nameof<Stopword>(x => x.id),
				nameof<Stopword>(x => x.name),
				nameof<Stopword>(x => x.description),
				nameof<Stopword>(x => x.wordlist),
				nameof<Stopword>(x => x.visibility),
				nameof<Stopword>(x => x.creation_date),
				nameof<Stopword>(x => x.location)
			]
		};

    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(...[
      {
        prop: nameof<Stopword>(x => x.name),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.NAME'
      }, 
      {
        prop: nameof<Stopword>(x => x.description),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.DESCRIPTION'
      },
      {
        prop: nameof<Stopword>(x => x.creation_date),
        pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.CREATION-DATE'
      },
      {
        prop: nameof<Stopword>(x => x.creator),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.CREATOR'
      },
      {
        prop: nameof<Stopword>(x => x.location),
        sortable: true,
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
    protected stopwordService: StopwordService,
    private pipeService: PipeService,
    private formBuilder: FormBuilder

  ) { 
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpLikeFilterFormGroup();
    this._setUpFiltersFormGroup();
    this.refresh();
  }
  
  public refresh(): void{
    this.onStopwordSelect.emit(null);
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public edit(stopword: Stopword): void{
    this.dialog.open(RenameStopwordComponent, {
      width: '25rem',
      disableClose: true,
      data:{
        stopword
      }
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed)
    )
    .subscribe(() => {
      this.onStopwordSelect.emit(null);
      this.snackbars.successfulUpdate();
      this.refresh();
    })
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
				nameof<Stopword>(x => x.id),
        nameof<Stopword>(x => x.wordlist),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

  onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
      this.onStopwordSelect.emit($event.row);
    }
  }

  addNewStopwordFromFile(): void{
    this.dialog.open(NewStopwordFromFileComponent,{
      width: '50rem',
      disableClose: true,
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed),
    )
    .subscribe( () =>{
      this.onStopwordSelect.emit(null);
      this.snackbars.successfulCreation();
      this.refresh();
    });
  }

  addNewStopwordManually(): void{
    this.dialog.open(NewStopwordManuallyComponent,{
      width: '50rem',
      disableClose: true,
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed),
    )
    .subscribe( () =>{
      this.onStopwordSelect.emit(null);
      this.snackbars.successfulUpdate();
      this.refresh();
    });
  }
}
