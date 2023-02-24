import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { KeywordLookup } from '@app/core/query/keyword.lookup';
import { KeywordService } from '@app/core/services/http/keyword.service';
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
import { NewKeywordFromFileComponent } from './new-keyword-from-file/new-keyword-from-file.component';
import { NewKeywordManuallyComponent } from './new-keyword-manually/new-keyword-manually.component';
import { RenameKeywordComponent } from './rename-keyword/rename-keyword.component';

@Component({
  selector: 'app-keywords-listing',
  templateUrl: './keywords-listing.component.html',
  styleUrls: ['./keywords-listing.component.css']
})
export class KeywordsListingComponent extends BaseListingComponent<Keyword, KeywordLookup> implements OnInit {
  
  userSettingsKey: UserSettingsKey;
  
  filterEditorConfiguration: FilterEditorConfiguration = {
    items: [
      {
        key: 'creation_date',
        type: FilterEditorFilterType.DatePicker,
        label: 'APP.WORD-LIST-COMPONENT.KEYWORDS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
      },
      {
        key: 'creator',
        type: FilterEditorFilterType.TextInput,
        placeholder: 'APP.WORD-LIST-COMPONENT.KEYWORDS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
      },
      {
        key: 'mine',
        type: FilterEditorFilterType.Checkbox,
        label: 'APP.WORD-LIST-COMPONENT.KEYWORDS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
      },
    ]
  };

  likeFilterFormGroup: FormGroup;
  filterFormGroup: FormGroup;

  @Output()
  onKeywordSelect = new EventEmitter<Keyword>();

  SelectionType = SelectionType;

  protected loadListing(): Observable<QueryResult<Keyword>> {
    return this.keywordService.query(this.lookup);
  }
  protected initializeLookup(): KeywordLookup {
    const lookup = new KeywordLookup();
    lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = ['ACTIVE'] as any;
		lookup.order = { items: ['-' + nameof<Keyword>(x => x.createdAt)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<Keyword>(x => x.id),
				nameof<Keyword>(x => x.name),
				nameof<Keyword>(x => x.description),
				nameof<Keyword>(x => x.wordlist),
				nameof<Keyword>(x => x.location),
				nameof<Keyword>(x => x.visibility),
				nameof<Keyword>(x => x.creation_date),
			]
		};

    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(...[
      {
        prop: nameof<Keyword>(x => x.name),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.NAME'
      }, 
      {
        prop: nameof<Keyword>(x => x.description),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.DESCRIPTION'
      },
      {
        prop: nameof<Keyword>(x => x.creation_date),
        pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.CREATION-DATE'
      },
      {
        prop: nameof<Keyword>(x => x.creator),
        sortable: true,
        resizeable: true,
        languageName: 'APP.WORD-LIST-COMPONENT.CREATOR'
      },
      {
        prop: nameof<Keyword>(x => x.location),
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
    protected keywordService: KeywordService,
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
    this.onKeywordSelect.emit(null);
    this.onPageLoad({offset: 0} as PageLoadEvent);
  }

  public edit(keywordList: Keyword): void{
    this.dialog.open(RenameKeywordComponent, {
      width: '25rem',
      disableClose: true,
      data:{
        keywordList
      }
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed)
    )
    .subscribe(() => {
      this.onKeywordSelect.emit(null);
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

  protected onColumnsChanged(event: ColumnsChangedEvent) {
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<Keyword>(x => x.id),
        nameof<Keyword>(x => x.wordlist),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

  public onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
      this.onKeywordSelect.emit($event.row);
    }
  }

  protected newKeywordFromFile(): void{
    this.dialog.open(NewKeywordFromFileComponent, {
      width: '50rem',
      disableClose: true
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed)
    )
    .subscribe(() => {
      this.onKeywordSelect.emit(null);
      this.snackbars.successfulCreation();
      this.refresh();
    })
  }

  protected newKeywordManually(): void{
    this.dialog.open(NewKeywordManuallyComponent, {
      width: '50rem',
      disableClose: true
    })
    .afterClosed()
    .pipe(
      filter(x => x),
      takeUntil(this._destroyed)
    )
    .subscribe(() => {
      this.onKeywordSelect.emit(null);
      this.snackbars.successfulCreation();
      this.refresh();
    })
  }
}
