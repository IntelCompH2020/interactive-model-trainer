import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Document, DomainModel } from '@app/core/model/model/domain-model.model';
import { Topic, TopicModelListing } from '@app/core/model/model/topic-model.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { BaseComponent } from '@common/base/base.component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { DataTableTopicModelTypeFormatPipe } from '@common/formatting/pipes/topic-model-type.pipe';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DomainModelsListingComponent } from './domain-models-listing/domain-models-listing.component';
import { ModelDetailsComponent } from './model-details/model-details.component';
import { PyLDAComponent } from './topic-models-listing/py-lda-vis-modal/py-lda-vis-modal.component';
import { TopicModelsListingComponent } from './topic-models-listing/topic-models-listing.component';
import { RunningTasksService } from '@app/core/services/http/running-tasks.service';
import { RunningTaskQueueItem, RunningTaskType, RunningTasksQueueService } from '@app/core/services/ui/running-tasks-queue.service';
import { ModelTaskDetailsComponent } from './model-task-details/model-task-details.component';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent extends BaseComponent implements OnInit {

  modelSelected: TopicModelListing | DomainModel;
  topicSelected: Topic;
  documentSelected: Document;

  get modelTitle() {
    return this.modelSelected?.name;
  }

  get topicTitle() {
    const title = this.topicSelected?.label;
    if (title && title.length > 30) return title.substring(0, 30) + "...";
    if (title && title.length <= 30) return title;
  }

  get documentTitle() {
    const title = this.documentSelected?.id;
    return title;
  }

  get isTopicModelListing() {
    return this.selectedModelType === ModelType.Topic;
  }

  get isDomainModelListing() {
    return this.selectedModelType === ModelType.Domain;
  }

  selectedModelType: ModelType;
  ModelType = ModelType;
  modelSelectionSubscription: Subscription;
  topicSelectionSubscription: Subscription;
  documentSelectionSubscription: Subscription;
  documentsLoadedSubject: BehaviorSubject<Document[]>;

  modelDetails: DetailsItem[];
  topicDetails: DetailsItem[];
  documentDetails: DetailsItem[];

  //Spinners control
  trainingParamsLoading: boolean = false;
  _curatingTopicModel: boolean = false;
  get curatingTopicModel(): boolean {
    if (this.isDomainModelListing) return false;
    else if (this._curatingTopicModel) return true;
    else return this.runningTasksQueueService.curating.filter(item => {
      return item.label === this.modelSelected.name;
    }).length === 1;
  }
  get curatingDomainModel(): boolean {
    if (this.isTopicModelListing) return false;
    else return this.runningTasksQueueService.curating.filter(item => {
      return item.label === this.modelSelected.name;
    }).length === 1;
  }
  get curatingDomainModelFinished(): RunningTaskQueueItem[] {
    let result: RunningTaskQueueItem[] = [];
    if (this.isTopicModelListing) return undefined;
    else result = this.runningTasksQueueService.curatingFinished.filter(item => {
      return this.runningTasksQueueService.isDomainModelTask(item) && item.label === this.modelSelected.name;
    });
    return result;
  }
  recentTasksRemoving: boolean = false;

  private onRefresh: () => void;
  private onRenameItem: () => void;
  private onUpdateItem: () => void;
  private onCopyItem: () => void;
  private onRenameTopic: () => void;
  private onFuseTopics: () => void;
  private onDeleteTopics: () => void;
  private onDeleteTopic: () => void;
  private onSortTopics: () => void;
  private onResetItem: () => void;
  private onShowSimilarTopics: () => void;
  private onSetTopicLabels: () => void;
  private onDomainRetrain: () => void;
  private onDomainClassify: () => void;
  private onDomainEvaluate: () => void;
  private onDomainSample: () => void;

  constructor(
    private dialog: MatDialog,
    protected language: TranslateService,
    protected snackbars: SnackBarCommonNotificationsService,
    private topicModelService: TopicModelService,
    private domainModelService: DomainModelService,
    private runningTasksService: RunningTasksService,
    private runningTasksQueueService: RunningTasksQueueService,
    public enumUtils: AppEnumUtils,
    private pipeService: PipeService
  ) {
    super();
  }

  ngOnInit(): void { }

  onEdit(updateAll: boolean = false): void {
    if (updateAll) this.onUpdateItem?.();
    else this.onRenameItem?.();
  }

  onCopy(): void {
    this.onCopyItem?.();
  }

  onAttach(activeComponent: Component): void {
    this.documentsLoadedSubject = new BehaviorSubject<Document[]>([]);

    if (this.modelSelectionSubscription) {
      this.modelSelectionSubscription.unsubscribe();
      this.modelSelectionSubscription = null;
    }
    if (this.topicSelectionSubscription) {
      this.topicSelectionSubscription.unsubscribe();
      this.topicSelectionSubscription = null;
    }
    if (this.documentSelectionSubscription) {
      this.documentSelectionSubscription.unsubscribe();
      this.documentSelectionSubscription = null;
    }

    this.modelSelected = null;
    this.topicSelected = null;
    this.documentSelected = null;
    this.selectedModelType = null;
    this.modelDetails = [];
    this.topicDetails = [];
    this.documentDetails = [];
    this.onRefresh = null;
    this.onRenameItem = null;
    this.onUpdateItem = null;
    this.onCopyItem = null;
    this.onRenameTopic = null;
    this.onFuseTopics = null;
    this.onDeleteTopics = null;
    this.onDeleteTopic = null;
    this.onSortTopics = null;
    this.onResetItem = null;
    this.onShowSimilarTopics = null;
    this.onSetTopicLabels = null;
    this.onDomainRetrain = null;
    this.onDomainClassify = null;
    this.onDomainEvaluate = null;
    this.onDomainSample = null;

    switch (true) {
      case activeComponent instanceof TopicModelsListingComponent: {
        const castedActiveComponent = activeComponent as TopicModelsListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onTopicModelSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.modelDetails = this._buildTopicModelDetails(model);
            this.modelSelected = model;
            this.selectedModelType = ModelType.Topic;
          }
        )

        this.topicSelectionSubscription = castedActiveComponent.onTopicSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          topic => {
            if (topic) this.topicDetails = this._buildTopicDetails(topic);
            this.topicSelected = topic;
          }
        )

        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onRenameItem = () => {
          castedActiveComponent.edit(this.modelSelected as TopicModelListing);
        }

        this.onUpdateItem = () => {
          castedActiveComponent.edit(this.modelSelected as TopicModelListing, true);
        }

        this.onCopyItem = () => {
          castedActiveComponent.copy(this.modelSelected as TopicModelListing);
        }

        this.onRenameTopic = () => {
          this._curatingTopicModel = true;
          castedActiveComponent.editTopic(this.modelSelected as TopicModelListing, this.topicSelected as Topic, () => {
            this._curatingTopicModel = false;
          });
        }

        this.onFuseTopics = () => {
          castedActiveComponent.fuseTopics(this.modelSelected as TopicModelListing, (state) => {
            if (state) this.snackbars.operationStarted();
            else this.snackbars.notSuccessfulOperation();
          });
        }

        this.onDeleteTopics = () => {
          this._curatingTopicModel = true;
          castedActiveComponent.deleteTopics(this.modelSelected as TopicModelListing, () => {
            this._curatingTopicModel = false;
          });
        }

        this.onDeleteTopic = () => {
          this._curatingTopicModel = true;
          castedActiveComponent.deleteTopic(this.modelSelected as TopicModelListing, this.topicSelected as Topic, () => {
            this._curatingTopicModel = false;
          });
        }

        this.onSortTopics = () => {
          castedActiveComponent.sortTopics(this.modelSelected as TopicModelListing, (state) => {
            if (state) this.snackbars.operationStarted();
            else this.snackbars.notSuccessfulOperation();
          });
        }

        this.onResetItem = () => {
          castedActiveComponent.resetModel(this.modelSelected as TopicModelListing, (state) => {
            if (state) this.snackbars.operationStarted();
            else this.snackbars.notSuccessfulOperation();
          });
        }

        this.onShowSimilarTopics = () => {
          castedActiveComponent.showSimilar(this.modelSelected as TopicModelListing);
        }

        this.onSetTopicLabels = () => {
          this._curatingTopicModel = true;
          castedActiveComponent.setLabels(this.modelSelected as TopicModelListing, () => {
            this._curatingTopicModel = false;
          });
        }

        break;
      }
      case activeComponent instanceof DomainModelsListingComponent: {
        const castedActiveComponent = activeComponent as DomainModelsListingComponent;

        this.documentsLoadedSubject.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          documents => {
            castedActiveComponent.documents.next([]);
            castedActiveComponent.documents.next(documents);
          }
        );

        this.modelSelectionSubscription = castedActiveComponent.onDomainModelSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.modelDetails = this._buildDomainModelDetails(model);
            this.modelSelected = model;
            this.selectedModelType = ModelType.Domain;
          }
        );

        this.documentSelectionSubscription = castedActiveComponent.onDocumentSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          document => {
            if (document) this.documentDetails = this._buildDocumentDetails(document);
            this.documentSelected = document;
          }
        )

        this.onRefresh = () => {
          this.documentsLoadedSubject.next([]);
          castedActiveComponent.refresh();
        }

        this.onRenameItem = () => {
          castedActiveComponent.edit(this.modelSelected as DomainModel);
        }

        this.onUpdateItem = () => {
          castedActiveComponent.edit(this.modelSelected as DomainModel, true);
        }

        this.onCopyItem = () => {
          castedActiveComponent.copy(this.modelSelected as DomainModel);
        }

        this.onDomainRetrain = () => {
          castedActiveComponent.retrain(this.modelSelected as DomainModel, () => {
            this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
          });
        }

        this.onDomainClassify = () => {
          castedActiveComponent.classify(this.modelSelected as DomainModel, () => {
            this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
          });
        }

        this.onDomainEvaluate = () => {
          castedActiveComponent.evaluate(this.modelSelected as DomainModel, () => {
            this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
          });
        }

        this.onDomainSample = () => {
          castedActiveComponent.sample(this.modelSelected as DomainModel, () => {
            this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
          });
        }

        break;
      }
    }
  }

  onDelete(): void {

    this.dialog.open(ConfirmationDialogComponent,
      {
        disableClose: true,
        data: {
          message: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.MESSAGE'),
          confirmButton: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.CONFIRM-BUTTON'),
          cancelButton: this.language.instant('APP.COMMONS.DELETE-CONFIRMATION.CANCEL-BUTTON')
        }
      }
    )
      .afterClosed()
      .pipe(
        filter(x => x),
        takeUntil(
          this._destroyed
        ),
      )
      .subscribe(
        () => {
          switch (this.selectedModelType) {
            case ModelType.Domain: {
              this.domainModelService.delete(this.modelSelected.name)
                .pipe(takeUntil(
                  this._destroyed
                ))
                .subscribe(_response => {
                  this.snackbars.successfulDeletion();
                  this.onRefresh?.();
                })
              break;
            }
            case ModelType.Topic: {
              this.topicModelService.delete(this.modelSelected.name)
                .pipe(takeUntil(
                  this._destroyed
                ))
                .subscribe(_response => {
                  this.snackbars.successfulDeletion();
                  this.onRefresh?.();
                })
              break;
            }
            default: {
              console.warn('no type defined');
            }
          }
        }
      )

  }

  showPyLDAvis(): void {
    if ((this.modelSelected as TopicModelListing).hierarchyLevel === 1) {
      const parentName: string = (this.modelSelected as TopicModelListing).TrDtSet;
      this.topicModelService.pyLDAvisHierarchicalUrl(parentName, this.modelSelected.name).subscribe(url => {
        this.dialog.open(PyLDAComponent,
          {
            maxWidth: "90vw",
            height: 'auto',
            disableClose: true,
            data: {
              name: this.modelSelected.name,
              parentName,
              url
            }
          }
        )
      });
    } else {
      this.topicModelService.pyLDAvisUrl(this.modelSelected.name).subscribe(url => {
        this.dialog.open(PyLDAComponent,
          {
            maxWidth: "90vw",
            height: 'auto',
            disableClose: true,
            data: {
              name: this.modelSelected.name,
              parentName: null,
              url
            }
          }
        )
      });
    }
  }

  showCuratingResults(): void {
    this.dialog.open(ModelTaskDetailsComponent,
      {
        maxWidth: "90vw",
        width: "80rem",
        disableClose: true,
        data: this.curatingDomainModelFinished
      }
    ).afterClosed().subscribe((response: any) => {
      if (response && response['action'] === 'LOAD_DOCUMENTS') {
        this.runningTasksService.getSampledDocuments(response['item']['task']).subscribe(res => {
          this.documentsLoadedSubject.next(res.items);
        });
      } else if (response && response['action'] === 'CLEAR_ITEMS') {
        this.recentTasksRemoving = true;
        let tasks = [];
        for (let item of response['items']) {
          tasks.push(this.runningTasksService.clearFinishedTask(item.task));
        }
        forkJoin(tasks).subscribe(() => {
          this._refreshDocumentsAndDomainTasks();
        });
      }
    });
  }

  clearCuratingResults(): void {
    this.recentTasksRemoving = true;
    let tasks = [];
    for (let item of this.curatingDomainModelFinished) {
      tasks.push(this.runningTasksService.clearFinishedTask(item.task));
    }
    if (tasks.length) {
      forkJoin(tasks).subscribe(() => {
        this._refreshDocumentsAndDomainTasks();
      });
    }
  }

  private _refreshDocumentsAndDomainTasks(): void {
    this.recentTasksRemoving = false;
    this.documentsLoadedSubject.next([]);
    this.runningTasksQueueService.loadRunningTasks(RunningTaskType.curating);
  }

  private _buildTopicModelDetails(model: TopicModelListing): DetailsItem[] {
    return [
      {
        label: 'APP.MODELS-COMPONENT.NAME',
        value: model.name || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DESCRIPTION',
        value: model.description || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(model.creation_date)
      },
      {
        label: 'APP.MODELS-COMPONENT.CREATOR',
        value: model.creator || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.LOCATION',
        value: model.location || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TYPE',
        value: (new DataTableTopicModelTypeFormatPipe(this.enumUtils)).transform(model.type)
      },
      {
        label: 'APP.MODELS-COMPONENT.TRAINED-CORPUS',
        value: model.TrDtSet || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.HIERARCHY-LEVEL',
        value: model.hierarchyLevel?.toString() || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.VISIBILITY',
        value: model.visibility || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.MORE-DETAILS',
        value: 'APP.MODELS-COMPONENT.MORE-DETAILS-SHOW',
        button: true,
        action: () => {
          this.trainingParamsLoading = true;
          this.topicModelService.get(model.name).subscribe(response => {
            this.trainingParamsLoading = false;
            this.dialog.open(ModelDetailsComponent,
              {
                width: '40rem',
                maxWidth: "90vw",
                maxHeight: '90vh',
                disableClose: true,
                data: {
                  model: response?.items[0]
                }
              }
            );
          }, error => {
            this.trainingParamsLoading = false;
            console.error(error);
            this.snackbars.notSuccessfulOperation();
          })
        }
      },
    ];
  }

  private _buildTopicDetails(topic: Topic): DetailsItem[] {
    return [
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.ID',
        value: topic.id?.toString() || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.SIZE',
        value: topic.size || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.LABEL',
        value: topic.label || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.WORD-DESCRIPTION',
        value: topic.wordDescription || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.DOCS-ACTIVE',
        value: topic.docsActive || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.ENTROPY',
        value: topic.topicEntropy || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TOPIC.COHERENCE',
        value: topic.topicCoherence || "-"
      }
    ];
  }

  private _buildDomainModelDetails(model: DomainModel): DetailsItem[] {

    return [
      {
        label: 'APP.MODELS-COMPONENT.NAME',
        value: model.name || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DESCRIPTION',
        value: model.description || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DOMAIN-NAME',
        value: model.tag || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(model.creation_date)
      },
      {
        label: 'APP.MODELS-COMPONENT.CREATOR',
        value: model.creator || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.LOCATION',
        value: model.location || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.TRAINED-CORPUS',
        value: model.TrDtSet || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.VISIBILITY',
        value: model.visibility || "-"
      },
      // {
      //   label: 'APP.MODELS-COMPONENT.MORE-DETAILS',
      //   value: '...'
      // },
    ];

  }

  private _buildDocumentDetails(document: Document): DetailsItem[] {
    return [
      {
        label: 'APP.MODELS-COMPONENT.DOCUMENT.ID',
        value: document.id || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DOCUMENT.INDEX',
        value: document.index || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DOCUMENT.TITLE',
        value: document.title || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DOCUMENT.TEXT',
        value: document.text || "-"
      },
      {
        label: 'APP.MODELS-COMPONENT.DOCUMENT.LABEL',
        value: document.label?.toString() || "-"
      }
    ];
  }

}

enum ModelType {
  Topic = 'topic',
  Domain = 'domain'
}

type DetailsItem = SimpleDetailsItem | ButtonDetailsItem;

interface SimpleDetailsItem {
  label: string;
  value: string;
}

interface ButtonDetailsItem {
  label: string;
  value: string;
  button: boolean;
  action: Function;
}