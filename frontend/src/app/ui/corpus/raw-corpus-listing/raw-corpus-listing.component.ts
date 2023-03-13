import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { Observable } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

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
      },
      {
        key: 'creator',
        type: FilterEditorFilterType.TextInput,
        placeholder: 'APP.CORPUS-COMPONENT.RAW-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
      },
      {
        key: 'mine',
        type: FilterEditorFilterType.Checkbox,
        label: 'APP.CORPUS-COMPONENT.RAW-CORPUS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
      },
    ]
  };

  likeFilterFormGroup: FormGroup;
  filterFormGroup: FormGroup;

  @Output() onCorpusSelect = new EventEmitter<RawCorpus>();

  SelectionType = SelectionType;

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
        sortable: true,
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
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpLikeFilterFormGroup();
    this._setUpFiltersFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refresh(): void{
    this.onCorpusSelect.emit(null);
    this.onPageLoad({offset: 0} as PageLoadEvent);
  }

  public export(corpus: RawCorpus): void {
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
				nameof<RawCorpus>(x => x.id),
        nameof<RawCorpus>(x => x.schema),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

  onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
      this.onCorpusSelect.emit($event.row);
    }
  }

}