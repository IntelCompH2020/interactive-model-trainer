import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelLookup } from '@app/core/query/domain-model.lookup';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
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
import { Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { DomainModelFromCategoryNameComponent } from './domain-model-from-category-name/domain-model-from-category-name.component';
import { DomainModelFromKeywordsComponent } from './domain-model-from-keywords/domain-model-from-keywords.component';
import { DomainModelFromSelectionFunctionComponent } from './domain-model-from-selection-function/domain-model-from-selection-function.component';
import { RenameDomainModelComponent } from './rename-domain-model/rename-domain-model.component';

@Component({
	selector: 'app-domain-models-listing',
	templateUrl: './domain-models-listing.component.html',
	styleUrls: ['./domain-models-listing.component.css']
})
export class DomainModelsListingComponent extends BaseListingComponent<DomainModel, DomainModelLookup> implements OnInit {
	userSettingsKey: UserSettingsKey;

	filterEditorConfiguration: FilterEditorConfiguration;
	filterFormGroup: FormGroup;
	likeFilterFormGroup: FormGroup;

	@Output()
	onDomainModelSelect = new EventEmitter<DomainModel>();

	private _domainModelSelected: DomainModel = null;

	SelectionType = SelectionType;

	protected loadListing(): Observable<QueryResult<DomainModel>> {
		return this.domainModelService.query(this.lookup);
	}

	protected initializeLookup(): RawCorpusLookup {
		const lookup = new RawCorpusLookup();
		lookup.metadata = { countAll: true };
		lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
		lookup.isActive = [IsActive.Active];
		lookup.order = { items: ['-' + nameof<DomainModel>(x => x.creation_date)] };
		this.updateOrderUiFields(lookup.order);

		lookup.project = {
			fields: [
				nameof<DomainModel>(x => x.id),
				nameof<DomainModel>(x => x.name),
				nameof<DomainModel>(x => x.description),
				nameof<DomainModel>(x => x.tag),
				nameof<DomainModel>(x => x.creation_date)
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
			prop: nameof<DomainModel>(x => x.description),
			sortable: false,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.DESCRIPTION'
		},
		{
			prop: nameof<DomainModel>(x => x.tag),
			sortable: true,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.TAG'
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
		protected snackbars: SnackBarCommonNotificationsService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected queryParamsService: QueryParamsService,
		protected language: TranslateService,
		public authService: AuthService,
		public enumUtils: AppEnumUtils,
		protected dialog: MatDialog,
		protected domainModelService: DomainModelService,
		private trainingQueueService: TrainingQueueService,
		private modelSelectionService: ModelSelectionService,
		private pipeService: PipeService,
		private formBuilder: FormBuilder
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();

		this._buildFilterEditorConfiguration();
	}

	ngOnInit(): void {
		super.ngOnInit();
		this._setUpFiltersFormGroup();
		this._setUpLikeFilterFormGroup();
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	public refresh(): void {
    this.onDomainModelSelect.emit(null);
    this._domainModelSelected = null;
    this.modelSelectionService.model = "";
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

	public edit(model: DomainModel): void {
    this.dialog.open(RenameDomainModelComponent, {
      width: '25rem',
      disableClose: true,
      data: {
        model
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

	private _buildFilterEditorConfiguration(): void {
    this.filterEditorConfiguration = {
			items: [
				{
					key: 'createdAt',
					type: FilterEditorFilterType.DatePicker,
					label: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
				},
				{
					key: 'tag',
					type: FilterEditorFilterType.TextInput,
					placeholder: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.TAG-PLACEHOLDER'
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
	}

	onColumnsChanged(event: ColumnsChangedEvent) {
		this.onDomainModelSelect.emit(null);
    this._domainModelSelected = null;
		this.onColumnsChangedInternal(event.properties.map(x => x.toString()));
	}

	private onColumnsChangedInternal(columns: string[]) {
		// Here are defined the projection fields that always requested from the api.
		this.lookup.project = {
			fields: [
				nameof<DomainModel>(x => x.id),
				nameof<DomainModel>(x => x.name),
				...columns
			]
		};
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
	}

	onRowActivated($event: RowActivateEvent) {
		const selectedModel: DomainModel = $event.row as DomainModel;
    if ($event.type === 'click') {
      if (this._domainModelSelected && selectedModel.name === this._domainModelSelected.name) return;
			this.onDomainModelSelect.emit(selectedModel);
      this._domainModelSelected = selectedModel;
      this.modelSelectionService.model = this._domainModelSelected.name;
    }
	}

	// newDomainModelFromSourceFile(): void {
	// 	this.dialog.open(
	// 		DomainModelFromSourceFileComponent,
	// 		{
	// 			minWidth: '50rem',
	// 			disableClose: true
	// 		}
	// 	)
	// 		.afterClosed()
	// 		.pipe(
	// 			filter(x => x),
	// 			takeUntil(this._destroyed)
	// 		)
	// 		.subscribe(() => this.openTrainingModelDialog());
	// }

	newDomainModelFromKeywords(): void {
		this.dialog.open(
			DomainModelFromKeywordsComponent,
			{
				width: '80rem',
				maxWidth: '95vw',
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

	newDomainModelFromSelectionFunction(): void {
		this.dialog.open(
			DomainModelFromSelectionFunctionComponent,
			{
				width: '80rem',
				maxWidth: '95vw',
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

	newDomainModelFromCategoryName(): void {
		this.dialog.open(
			DomainModelFromCategoryNameComponent,
			{
				width: '80rem',
				maxWidth: '95vw',
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

	openTrainingModelDialog(): void {
		this.dialog.open(TrainingModelProgressComponent, {
			disableClose: true,
			minWidth: '80vw'
		})
			.afterClosed()
			.pipe(
				takeUntil(this._destroyed),
				filter(x => x)
			)
			.subscribe(() => this.trainingQueueService.addItem({
				label: 'my label',
				finished: false
			}));
	}

}
