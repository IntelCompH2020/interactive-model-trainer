import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { TopicModelSubtype } from '@app/core/enum/topic-model-subtype.enum';
import { TopicModelType } from '@app/core/enum/topic-model.-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Topic, TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicModelLookup } from '@app/core/query/topic-model.lookup';
import { TopicLookup } from '@app/core/query/topic.lookup';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { RunningTasksQueueService } from '@app/core/services/ui/running-tasks-queue.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { DataTableTopicModelTypeFormatPipe } from '@common/formatting/pipes/topic-model-type.pipe';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { ColumnsChangedEvent, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { TopicSelectionComponent } from './topic-selection-modal/topic-selection-modal.component';
import { NewTopicModelComponent } from './new-topic-model/new-topic-model.component';
import { TopicSimilaritiesComponent } from './topic-similarities-modal/topic-similarities-modal.component';
import { TopicLabelsComponent } from './topic-labels-modal/topic-labels-modal.component';
import { RenameTopicComponent } from './rename-topic/rename-topic.component';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { ModelPatchComponent } from '../model-patch/model-patch-modal.component';
import { RenameDialogComponent } from '@app/ui/rename-dialog/rename-dialog.component';
import { RenamePersist } from '@app/ui/rename-dialog/rename-editor.model';
import { RunningTasksService } from '@app/core/services/http/running-tasks.service';

@Component({
  selector: 'app-topic-models-listing',
  templateUrl: './topic-models-listing.component.html',
  styleUrls: ['./topic-models-listing.component.css']
})
export class TopicModelsListingComponent extends BaseListingComponent<TopicModel, TopicModelLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  filterEditorConfiguration: FilterEditorConfiguration;
  filterFormGroup: FormGroup;
  likeFilterFormGroup: FormGroup;

  @Output()
  onTopicModelSelect = new EventEmitter<TopicModel>();
  @Output()
  onTopicSelect = new EventEmitter<Topic>();
  private _topicSelected: Topic = null;
  private _topicModelSelected: TopicModel = null;

  get topicSelected(): Topic {
    return this._topicSelected;
  }

  selectedModel: BehaviorSubject<TopicModel> = new BehaviorSubject(undefined);
  topicLookup: TopicLookup = new TopicLookup();

  SelectionType = SelectionType;

  protected loadListing(): Observable<QueryResult<TopicModel>> {
    return this.topicModelService.query(this.lookup);
  }

  protected initializeLookup(): TopicModelLookup {
    const lookup = new TopicModelLookup();
    lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<TopicModel>(x => x.createdAt)] };
    this.updateOrderUiFields(lookup.order);

    lookup.project = {
      fields: [
        nameof<TopicModel>(x => x.id),
        nameof<TopicModel>(x => x.name),
        nameof<TopicModel>(x => x.description),
        nameof<TopicModel>(x => x.creator),
        nameof<TopicModel>(x => x.location),
        nameof<TopicModel>(x => x.type),
        nameof<TopicModel>(x => x.visibility),
        nameof<TopicModel>(x => x.creation_date),
        nameof<TopicModel>(x => x.TrDtSet)
      ]
    };

    return lookup;
  }

  protected setupColumns() {
    this.gridColumns.push(...[{
      prop: nameof<TopicModel>(x => x.name),
      sortable: true,
      resizeable: true,
      alwaysShown: true,
      isTreeColumn: true,
      treeLevelIndent: 20,
      languageName: 'APP.MODELS-COMPONENT.NAME'
    },
    {
      prop: nameof<TopicModel>(x => x.description),
      sortable: false,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.DESCRIPTION'
    },
    {
      prop: nameof<TopicModel>(x => x.type),
      pipe: this.pipeService.getPipe<DataTableTopicModelTypeFormatPipe>(DataTableTopicModelTypeFormatPipe),
      sortable: false,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.TYPE'
    },
    {
      prop: nameof<TopicModel>(x => x.creation_date),
      pipe: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short'),
      sortable: true,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.CREATION-DATE'
    },
    {
      prop: nameof<TopicModel>(x => x.creator),
      sortable: true,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.CREATOR',
    },
    {
      prop: nameof<TopicModel>(x => x.TrDtSet),
      sortable: false,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.CORPUS'
    },
    {
      prop: nameof<TopicModel>(x => x.location),
      sortable: false,
      resizeable: true,
      languageName: 'APP.MODELS-COMPONENT.LOCATION'
    },
    ]);
  }

  availableTypes: TopicModelType[];
  availableSubTypes: TopicModelSubtype[];

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
    protected topicModelService: TopicModelService,
    protected runningTasksService: RunningTasksService,
    private trainingModelQueueService: RunningTasksQueueService,
    private pipeService: PipeService,
    private formBuilder: FormBuilder

  ) {
    super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
    this.lookup = this.initializeLookup();

    this.availableTypes = this.enumUtils.getEnumValues<TopicModelType>(TopicModelType);
    this.availableSubTypes = this.enumUtils.getEnumValues<TopicModelSubtype>(TopicModelSubtype);
    this._buildFilterEditorConfiguration();

    setTimeout(() => {
      this.setupVisibleColumns([
        nameof<TopicModel>(x => x.name),
        nameof<TopicModel>(x => x.description),
        nameof<TopicModel>(x => x.type),
        nameof<TopicModel>(x => x.creation_date),
        nameof<TopicModel>(x => x.TrDtSet)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpFiltersFormGroup();
    this._setUpLikeFilterFormGroup();
    this.onPageLoad({ offset: 0 } as PageLoadEvent);

    this.trainingModelQueueService.taskCompleted.subscribe((task) => {
      if (task.finished) this.refresh();
    });
  }

  public refresh(): void {
    this.onTopicModelSelect.emit(null);
    this._topicModelSelected = null;
    this.onTopicSelect.emit(null);
    this.topicLookup = new TopicLookup();
    this.selectedModel.next(undefined);
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  public refreshTopics(): void {
    this.onTopicSelect.emit(null);
    this.selectedModel.next(this._topicModelSelected);
  }

  public edit(model: TopicModel, updateAll: boolean = false): void {
    if (updateAll) {
      this.dialog.open(ModelPatchComponent,
        {
          width: "40rem",
          maxWidth: "90vw",
          disableClose: true,
          data: {
            model,
            modelType: "TOPIC"
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
          name: model.name,
          title: this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.RENAME-DIALOG.TITLE')
        }
      })
        .afterClosed()
        .pipe(
          filter(x => x),
          takeUntil(this._destroyed)
        )
        .subscribe((rename: RenamePersist) => {
          this.topicModelService.rename(rename).subscribe((_response) => {
            this.snackbars.successfulUpdate();
            this.refresh();
          });
        });
    }
  }

  public copy(model: TopicModel): void {
    this.topicModelService.copy(model.name).subscribe(
      _response => this.refresh()
    );
  }

  public editTopic(model: TopicModel, topic: Topic, callback: () => void): void {
    this.dialog.open(RenameTopicComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        model,
        topic
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed)
      )
      .subscribe((response) => {
        if (response) {
          this.snackbars.successfulUpdate();
          this.refreshTopics();
        }
        callback();
      });
  }

  public fuseTopics(model: TopicModel, callback: () => void): void {
    this.dialog.open(TopicSelectionComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: model.name,
        lookup: this.topicLookup,
        options: {
          minItems: 2
        }
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed)
      )
      .subscribe((topics) => {
        if (topics) {
          this.topicModelService.fuseTopics(model.name, { topics }).subscribe(() => {
            this.snackbars.successfulOperation(true);
            this.refreshTopics();
            callback();
          }, error => {
            console.error(error);
            this.snackbars.notSuccessfulOperation();
            callback();
          });
        } else callback();
      });
  }

  public deleteTopics(model: TopicModel, callback: () => void): void {
    this.dialog.open(TopicSelectionComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: model.name,
        lookup: this.topicLookup,
        options: {
          minItems: 1
        }
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed)
      )
      .subscribe((topics) => {
        if (topics) {
          this.topicModelService.deleteTopics(model.name, { topics }).subscribe(() => {
            this.snackbars.successfulOperation(true);
            this.refreshTopics();
            callback();
          }, error => {
            console.error(error);
            this.snackbars.notSuccessfulOperation();
            callback();
          });
        } else callback();
      });
  }

  public deleteTopic(model: TopicModel, topic: Topic, callback: () => void): void {
    this.dialog.open(ConfirmationDialogComponent,
      {
        data: {
          message: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.MESSAGE'),
          confirmButton: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.CONFIRM-BUTTON'),
          cancelButton: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.CANCEL-BUTTON')
        }
      }
    )
      .afterClosed()
      .pipe(
        takeUntil(
          this._destroyed
        ),
      ).subscribe((response) => {
        if (response) {
          this.topicModelService.deleteTopics(model.name, { topics: [topic.id] }).subscribe(() => {
            this.snackbars.successfulOperation(true);
            this.refreshTopics();
            callback();
          }, error => {
            console.error(error);
            this.snackbars.notSuccessfulOperation();
            callback();
          });
        } else callback();

      })
  }

  public sortTopics(model: TopicModel, callback: () => void): void {
    this.topicModelService.sortTopics(model.name).subscribe(() => {
      this.snackbars.successfulOperation(true);
      this.refreshTopics();
      callback();
    }, error => {
      console.error(error);
      this.snackbars.notSuccessfulOperation();
      callback();
    });
  }

  public resetModel(model: TopicModel, callback: () => void): void {
    this.snackbars.operationStarted();
    this.topicModelService.reset(model.name).subscribe((task) => {
      const timeout = setInterval(() => {
        this.runningTasksService.getTaskStatus(task.id).subscribe((status) => {
          if (status === "COMPLETED" || status === "ERROR") {
            clearInterval(timeout);
            if (status === "COMPLETED") {
              this.snackbars.successfulOperation(true);
              this.refreshTopics();
            } else if (status === "ERROR") this.snackbars.notSuccessfulOperation();
            callback();
          }
        });
      }, 10000);
    }, error => {
      this.snackbars.notSuccessfulOperation();
      console.error(error);
      callback();
    });
  }

  public showSimilar(model: TopicModel): void {
    this.dialog.open(TopicSimilaritiesComponent, {
      width: '25rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: model.name
      }
    })
      .afterClosed()
      .pipe(
        filter(x => x),
        takeUntil(this._destroyed)
      )
      .subscribe(() => { });
  }

  public setLabels(model: TopicModel, callback: () => void): void {
    this.dialog.open(TopicLabelsComponent, {
      width: '80rem',
      maxWidth: "90vw",
      disableClose: true,
      data: {
        name: model.name
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed)
      )
      .subscribe((labels) => {
        if (labels) {
          this.topicModelService.setTopicLabels(model.name, { labels }).subscribe(() => {
            this.snackbars.successfulUpdate();
            this.refreshTopics();
            callback();
          }, error => {
            this.snackbars.notSuccessfulOperation();
            console.error(error);
            callback();
          });
        } else callback();
      });
  }

  private _buildFilterEditorConfiguration(): void {
    this.filterEditorConfiguration = {
      items: [
        {
          key: 'createdAt',
          type: FilterEditorFilterType.DatePicker,
          label: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.CREATION-DATE-PLACEHOLDER'
        },
        {
          key: 'trainer',
          type: FilterEditorFilterType.Select,
          label: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.TYPE',
          availableValues: this.availableTypes.map(type => ({ label: () => this.enumUtils.toTopicModelTypeString(type), value: type }))
        },
        {
          key: 'creator',
          type: FilterEditorFilterType.TextInput,
          placeholder: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.CREATOR-PLACEHOLDER'
        },
        {
          key: 'mine',
          type: FilterEditorFilterType.Checkbox,
          label: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.FILTER-OPTIONS.MINE-ITEMS'
        },
      ]
    }
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
    this.filterFormGroup.patchValue({ trainer: "all" }, { emitEvent: false });
  }

  onRowActivated($event: RowActivateEvent) {
    const selectedModel: TopicModel = $event.row as TopicModel;
    if ($event.type === 'click') {
      if (this._topicModelSelected && selectedModel.name === this._topicModelSelected.name) return;
      this.onTopicModelSelect.emit(selectedModel);
      this._topicModelSelected = selectedModel;
      this.selectedModel.next(this._topicModelSelected);
    }
  }

  onTreeAction(event: any) {

  }

  onTopicSelected(topic: Topic) {
    this._topicSelected = topic;
    this.onTopicSelect.emit(topic);
  }

  onTopicLookup(lookup: TopicLookup) {
    this.topicLookup = lookup;
  }

  addNewTopicModel(): void {
    this.dialog.open(NewTopicModelComponent, {
      width: "80rem",
      maxWidth: '90vw',
      disableClose: true,
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed),
        filter(x => x)
      ).subscribe(result => {
        if (result) this.snackbars.operationStarted();
      });
  }
}
