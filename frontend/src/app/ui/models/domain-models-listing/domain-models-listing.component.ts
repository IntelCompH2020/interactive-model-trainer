import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Document, DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelLookup } from '@app/core/query/domain-model.lookup';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { RenameDialogComponent } from '@app/ui/rename-dialog/rename-dialog.component';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { ModelPatchComponent } from '../model-patch/model-patch-modal.component';
import { DomainModelFromCategoryNameComponent } from './domain-model-from-category-name/domain-model-from-category-name.component';
import { DomainModelFromKeywordsComponent } from './domain-model-from-keywords/domain-model-from-keywords.component';
import { DomainModelFromSelectionFunctionComponent } from './domain-model-from-selection-function/domain-model-from-selection-function.component';
import { RunningTaskType, RunningTasksQueueService } from '@app/core/services/ui/running-tasks-queue.service';
import { retrainParams, evaluateParams, samplingParams } from './domain-model-params.model';
import { DomainModelEvaluateEditorModel } from './domain-model-evaluate-editor.model';
import { DomainModelRetrainEditorModel } from './domain-model-retrain-editor.model';
import { ModelParam } from '../model-parameters-table/model-parameters-table.component';
import { DomainModelCurationDialogComponent } from './domain-model-curation-dialog/domain-model-curation-dialog.component';
import { DomainModelSamplingEditorModel } from './domain-model-sampling-editor.model';
import { DocumentLookup } from '@app/core/query/document.lookup';

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

	retrainEditorModel: DomainModelRetrainEditorModel;
	retrainFormGroup: FormGroup;
	evaluateEditorModel: DomainModelEvaluateEditorModel;
	evaluateFormGroup: FormGroup;
	samplingEditorModel: DomainModelSamplingEditorModel;
	samplingFormGroup: FormGroup;

	@Output()
	onDomainModelSelect = new EventEmitter<DomainModel>();
	@Output()
	onDocumentSelect = new EventEmitter<Document>();
	private _domainModelSelected: DomainModel = null;
	private _documentSelected: Document = null;
	
	documents: BehaviorSubject<Document[]> = new BehaviorSubject([]); 
	documentLookup: DocumentLookup = new DocumentLookup();

	SelectionType = SelectionType;

	get retrainParams(): ModelParam[] {
		return retrainParams();
	}

	get evaluateParams(): ModelParam[] {
		return evaluateParams();
	}

	get samplingParams(): ModelParam[] {
		return samplingParams();
	}

	get selectedModel(): DomainModel {
		return this._domainModelSelected;
	}

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
				nameof<DomainModel>(x => x.visibility),
				nameof<DomainModel>(x => x.tag),
				nameof<DomainModel>(x => x.TrDtSet),
				nameof<DomainModel>(x => x.creator),
				nameof<DomainModel>(x => x.location),
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
			alwaysShown: true,
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
			languageName: 'APP.MODELS-COMPONENT.DOMAIN-NAME'
		},
		{
			prop: nameof<DomainModel>(x => x.creation_date),
			sortable: true,
			resizeable: true,
			pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
			languageName: 'APP.MODELS-COMPONENT.CREATION-DATE'
		},
		{
			prop: nameof<DomainModel>(x => x.TrDtSet),
			sortable: true,
			resizeable: true,
			languageName: 'APP.MODELS-COMPONENT.CORPUS'
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
		}]);
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
		private runningTasksQueueService: RunningTasksQueueService,
		private pipeService: PipeService,
		private formBuilder: FormBuilder
	) {
		super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
		this.lookup = this.initializeLookup();

		this._buildFilterEditorConfiguration();

		setTimeout(() => {
			this.setupVisibleColumns([
				nameof<DomainModel>(x => x.name),
				nameof<DomainModel>(x => x.description),
				nameof<DomainModel>(x => x.tag),
				nameof<DomainModel>(x => x.creation_date)
			]);
		}, 0);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this._setUpFiltersFormGroup();
		this._setUpLikeFilterFormGroup();
		this.onPageLoad({ offset: 0 } as PageLoadEvent);

		this.runningTasksQueueService.taskCompleted
			.pipe(
				debounceTime(300)
			).subscribe((task) => {
				if (this.runningTasksQueueService.isDomainModelTask(task)) {
					this.refreshDocuments(
						() => this.snackbars.successfulOperation(true)
					);
				}
			});
	}

	public refresh(callback?: () => void): void {
		this.onDomainModelSelect.emit(null);
		this._domainModelSelected = null;
		this.onDocumentSelect.emit(null);
		this._documentSelected = null;
		this.documents.next([]);
		this.onPageLoad({ offset: 0 } as PageLoadEvent);
		if (callback) callback();
	}

	public refreshDocuments(callback?: () => void): void {
		this.onDocumentSelect.emit(null);
		this._documentSelected = null;
		this.documents.next([]);
		if (callback) callback();
	}

	public edit(model: DomainModel, updateAll: boolean = false): void {
		if (updateAll) {
			this.dialog.open(ModelPatchComponent,
				{
					width: "40rem",
					maxWidth: "90vw",
					disableClose: true,
					data: {
						model,
						modelType: "DOMAIN"
					}
				}
			)
				.afterClosed()
				.pipe(
					filter(x => x),
					takeUntil(this._destroyed)
				)
				.subscribe(() => {
					this.refresh(
						() => this.snackbars.successfulUpdate()
					);
				});
		} else {
			this.dialog.open(RenameDialogComponent, {
				width: '25rem',
				maxWidth: "90vw",
				disableClose: true,
				data: {
					name: model.name,
					title: this.language.instant('APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.RENAME-DIALOG.TITLE')
				}
			})
				.afterClosed()
				.pipe(
					filter(x => x),
					takeUntil(this._destroyed)
				)
				.subscribe((rename: RenamePersist) => {
					this.domainModelService.rename(rename).subscribe((_response) => {
						this.refresh(
							() => this.snackbars.successfulUpdate()
						);
					});
				});
		}
	}

	public copy(model: DomainModel): void {
		this.domainModelService.copy(model.name).subscribe(
			_response => this.refresh(
				() => this.snackbars.successfulUpdate()
			)
		);
	}

	public retrain(model: DomainModel, callback: () => void): void {
		this.retrainEditorModel = new DomainModelRetrainEditorModel().withName(model.name);
		this.retrainFormGroup = this.retrainEditorModel.buildForm();
		this.dialog.open(DomainModelCurationDialogComponent, {
			width: '25rem',
			maxWidth: "90vw",
			disableClose: true,
			data: {
				title: this.language.instant('APP.MODELS-COMPONENT.RETRAIN'),
				formGroup: this.retrainFormGroup,
				parameters: this.retrainParams
			}
		})
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe((parameters: any) => {
				let params = {
					'classifier.epochs': parameters['epochs']
				}
				let payload = {
					name: model.name,
					parameters: params
				}
				this.domainModelService.retrain(payload).subscribe(
					_response => {
						this.snackbars.operationStarted();
						callback();
					}
				);
			});
	}

	public classify(model: DomainModel, callback: () => void): void {
		this.domainModelService.classify(model.name).subscribe(
			_response => {
				this.snackbars.operationStarted();
				callback();
			}
		);
	}

	public evaluate(model: DomainModel, callback: () => void): void {
		this.evaluateEditorModel = new DomainModelEvaluateEditorModel().withName(model.name);
		this.evaluateFormGroup = this.evaluateEditorModel.buildForm();
		this.dialog.open(DomainModelCurationDialogComponent, {
			width: '25rem',
			maxWidth: "90vw",
			disableClose: true,
			data: {
				title: this.language.instant('APP.MODELS-COMPONENT.EVALUATE'),
				formGroup: this.evaluateFormGroup,
				parameters: this.evaluateParams
			}
		})
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe((parameters: any) => {
				let params = {
					'evaluator.true_label_name': parameters['trueLabelName']
				}
				let payload = {
					name: model.name,
					parameters: params
				}
				this.domainModelService.evaluate(payload).subscribe(
					_response => {
						this.snackbars.operationStarted();
						callback();
					}
				);
			});
	}

	public sample(model: DomainModel, callback: () => void) {
		this.samplingEditorModel = new DomainModelSamplingEditorModel().withName(model.name);
		this.samplingFormGroup = this.samplingEditorModel.buildForm();
		this.dialog.open(DomainModelCurationDialogComponent, {
			width: '50rem',
			maxWidth: "90vw",
			disableClose: true,
			data: {
				title: this.language.instant('APP.MODELS-COMPONENT.SAMPLE'),
				modelName: model.name,
				formGroup: this.samplingFormGroup,
				parameters: this.samplingParams
			}
		})
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe((settings: DomainModelSamplingEditorModel) => {
				let params = {
					'sampler.sampler': settings['sampler'],
					'sampler.n_samples': settings['numOfDocuments']
				}
				let payload = {
					name: model.name,
					parameters: params
				}
				this.domainModelService.sample(payload).subscribe(
					_response => {
						this.snackbars.operationStarted();
						callback();
					}
				);
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
					placeholder: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.DOMAIN-NAME-PLACEHOLDER'
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

	onRowActivated($event: RowActivateEvent): void {
		const selectedModel: DomainModel = $event.row as DomainModel;
		if ($event.type === 'click') {
			if (this._domainModelSelected && selectedModel.name === this._domainModelSelected.name) return;
			this.onDomainModelSelect.emit(selectedModel);
			this._domainModelSelected = selectedModel;
		}
	}

	onDocumentSelected(document: Document): void {
		this._documentSelected = document;
		this.onDocumentSelect.emit(document);
	}

	onDocumentLookup(lookup: DocumentLookup): void {
		this.documentLookup = lookup;
	}

	onFeedbackSubmitted(submitted: boolean): void {
		if (submitted) {
			this.refreshDocuments();
			this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
		}
	}

	newDomainModelFromKeywords(): void {
		this.dialog.open(
			DomainModelFromKeywordsComponent,
			{
				width: '80rem',
				maxWidth: "90vw",
				maxHeight: '90vh',
				disableClose: true
			}
		)
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe(() => this.snackbars.operationStarted());
	}

	newDomainModelFromSelectionFunction(): void {
		this.dialog.open(
			DomainModelFromSelectionFunctionComponent,
			{
				width: '80rem',
				maxWidth: "90vw",
				maxHeight: '90vh',
				disableClose: true
			}
		)
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe(() => this.snackbars.operationStarted());
	}

	newDomainModelFromCategoryName(): void {
		this.dialog.open(
			DomainModelFromCategoryNameComponent,
			{
				width: '80rem',
				maxWidth: "90vw",
				maxHeight: '90vh',
				disableClose: true
			}
		)
			.afterClosed()
			.pipe(
				filter(x => x),
				takeUntil(this._destroyed)
			)
			.subscribe(() => this.snackbars.operationStarted());

	}

}

