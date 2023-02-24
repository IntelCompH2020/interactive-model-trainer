import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelLookup } from '@app/core/query/domain-model.lookup';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { TrainingQueueService } from '@app/core/services/ui/training-queue.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TrainingModelProgressComponent } from '@common/modules/training-model-progress/training-model-progress.component';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { Observable} from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { DomainModelFromCategoryNameComponent } from './domain-model-from-category-name/domain-model-from-category-name.component';
import { DomainModelFromKeywordsComponent } from './domain-model-from-keywords/domain-model-from-keywords.component';
import { DomainModelFromSelectionFunctionComponent } from './domain-model-from-selection-function/domain-model-from-selection-function.component';
import { DomainModelFromSourceFileComponent } from './domain-model-from-source-file/domain-model-from-source-file.component';

@Component({
  selector: 'app-domain-models-listing',
  templateUrl: './domain-models-listing.component.html',
  styleUrls: ['./domain-models-listing.component.css']
})
export class DomainModelsListingComponent extends BaseListingComponent<DomainModel, DomainModelLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  filterEditorConfiguration: FilterEditorConfiguration = {
    items: [
      {
        key: 'createdAt',
        type: FilterEditorFilterType.DatePicker,
        label: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
      },
      {
        key: 'creator',
        type: FilterEditorFilterType.TextInput,
        placeholder: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
      },
      {
        key: 'mine',
        type: FilterEditorFilterType.Checkbox,
        label: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
      },
    ]
  };
  filterFormGroup: FormGroup;
  
  @Output()
  onDomainModelSelect = new EventEmitter<DomainModel>();


  SelectionType = SelectionType;

  protected loadListing(): Observable<QueryResult<DomainModel>> {
    return this.domainModelService.query(this.lookup);
  }
  protected initializeLookup(): RawCorpusLookup {
    const lookup =  new RawCorpusLookup();
    lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<DomainModel>(x => x.createdAt)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<DomainModel>(x => x.id),
				nameof<DomainModel>(x => x.name),
				nameof<DomainModel>(x => x.creator),
				nameof<DomainModel>(x => x.location)
			]
		};


    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(...[{
			prop: nameof<DomainModel>(x => x.name),
			sortable: true,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.NAME'
		}, 
		{
			prop: nameof<DomainModel>(x => x.creation_date),
			sortable: true,
			resizeable: true,
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
			languageName: 'APP.MODELS-COMPONENT.CREATION-DATE'
		},
		{
			prop: nameof<DomainModel>(x => x.creator),
			sortable: true,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.CREATOR'
		},
		{
			prop: nameof<DomainModel>(x => x.location),
			sortable: false,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.LOCATION'
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
		protected domainModelService: DomainModelService,
		private trainingQueueService: TrainingQueueService,
		private pipeService: PipeService,
		private formBuilder: FormBuilder
  ) { 
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();
    
  }

  ngOnInit(): void {
    super.ngOnInit();
	this._setUpFiltersFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }


  private _setUpFiltersFormGroup(): void{

    this.filterFormGroup = this.formBuilder.group(
      this.filterEditorConfiguration.items.reduce((aggr, current)=>({...aggr, [current.key]: null}),{})
    )
    this.filterFormGroup.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(600)
    ).subscribe(filterChanges =>{
      
    });

    // * Experiment
    setTimeout(() => {
      this.filterFormGroup.get('mine').setValue(true, {emitEvent: false} );      
    }, 2000);
  }


  onColumnsChanged(event: ColumnsChangedEvent) {
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<DomainModel>(x => x.id),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}




  // * CUSTOM CODE
  onRowActivated($event: RowActivateEvent){
    if($event.type === 'click'){
      this.onDomainModelSelect.emit($event.row);
    }
  }


  newDomainModelFromSourceFile(): void{
	this.dialog.open(
		DomainModelFromSourceFileComponent,
		{
			minWidth: '50rem',
			disableClose: true
		}
	)
	.afterClosed()
	.pipe(
		filter(x => x),
		takeUntil(this._destroyed)
	)
	.subscribe(() => this.openTrainingModelDialog());
  }

  newDomainModelFromKeywords(): void{
	this.dialog.open(
		DomainModelFromKeywordsComponent,
		{
			minWidth: '50rem',
			disableClose: true
		}
	)
	.afterClosed()
	.pipe(
		filter(x => x),
		takeUntil(this._destroyed)
	)
	.subscribe(() => this.openTrainingModelDialog());
  }


 	 newDomainModelFromSelectionFunction(): void{
		this.dialog.open(
			DomainModelFromSelectionFunctionComponent,
			{
				minWidth: '50rem',
				disableClose: true
			}
		) 
		.afterClosed()
		.pipe(
			filter(x => x),
			takeUntil(this._destroyed)
		)
		.subscribe(() => this.openTrainingModelDialog());
	}	

 	newDomainModelFromCategoryName(): void{
		this.dialog.open(
			DomainModelFromCategoryNameComponent,
			{
				minWidth: '50rem',
				disableClose: true
			}
		)
		.afterClosed()
		.pipe(
			filter(x => x),
			takeUntil(this._destroyed)
		)
		.subscribe(() => this.openTrainingModelDialog());

  	}

	openTrainingModelDialog(): void{
		this.dialog.open(TrainingModelProgressComponent, {
			disableClose: true,
			minWidth: '80vw'
		})
		.afterClosed()
		.pipe(
			takeUntil(this._destroyed),
			filter(x => x)
		)
		.subscribe( () => this.trainingQueueService.addItem({
			label: 'my label',
			finished: false
		}));
	}

}
