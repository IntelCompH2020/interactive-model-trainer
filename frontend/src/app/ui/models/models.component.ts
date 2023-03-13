import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { Topic, TopicModel } from '@app/core/model/model/topic-model.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { BaseComponent } from '@common/base/base.component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { DataTableDomainModelTypeFormatPipe } from '@common/formatting/pipes/domain-model-type.pipe';
import { DataTableTopicModelTypeFormatPipe } from '@common/formatting/pipes/topic-model-type.pipe';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { error } from 'console';
import { Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DomainModelsListingComponent } from './domain-models-listing/domain-models-listing.component';
import { ModelDetailsComponent } from './model-details/model-details.component';
import { PyLDAComponent } from './topic-models-listing/py-lda-vis-modal/py-lda-vis-modal.component';
import { TopicModelsListingComponent } from './topic-models-listing/topic-models-listing.component';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent extends BaseComponent implements OnInit {

  modelSelected: TopicModel | DomainModel;
  topicSelected: Topic;

  get modelTitle() {
    return this.modelSelected?.name;
  }

  get topicTitle() {
    const title = this.topicSelected?.label;
    if (title && title.length > 30) return title.substring(0, 30) + "...";
    if (title && title.length <= 30) return title;
  }

  selectedModelType: ModelType;
  ModelType = ModelType;
  modelSelectionSubscription: Subscription;
  topicSelectionSubscription: Subscription;

  modelDetails: DetailsItem[];
  topicDetails: DetailsItem[];

  //Spinners control
  trainingParamsLoading: boolean = false;
  topicModelReseting: boolean = false;
  curatingModel: boolean = false;

  private onRefresh: () => void;
  private onEditItem: () => void;
  private onEditTopic: () => void;
  private onFuseTopics: () => void;
  private onDeleteTopics: () => void;
  private onDeleteTopic: () => void;
  private onSortTopics: () => void;
  private onReset: () => void;
  private showSimilarTopics: () => void;
  private onSetLabels: () => void;

  constructor(
    private dialog: MatDialog,
    private language: TranslateService,
    protected snackbars: SnackBarCommonNotificationsService,
    private topicModelService: TopicModelService,
    private domainModelService: DomainModelService,
    public enumUtils: AppEnumUtils,
    private pipeService: PipeService
  ) {
    super();
  }

  ngOnInit(): void { }

  onEdit(): void {
    this.onEditItem?.();
  }

  onAttach(activeComponent: Component): void {
    if (this.modelSelectionSubscription) {
      this.modelSelectionSubscription.unsubscribe();
      this.modelSelectionSubscription = null;
    }
    if (this.topicSelectionSubscription) {
      this.topicSelectionSubscription.unsubscribe();
      this.topicSelectionSubscription = null;
    }

    this.modelSelected = null;
    this.topicSelected = null;
    this.selectedModelType = null;
    this.modelDetails = [];
    this.topicDetails = [];
    this.onRefresh = null;
    this.onEditItem = null;
    this.onEditTopic = null;
    this.onFuseTopics = null;
    this.onDeleteTopics = null;
    this.onDeleteTopic = null;
    this.onSortTopics = null;
    this.onReset = null;
    this.showSimilarTopics = null;
    this.onSetLabels = null;

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

        this.onEditItem = () => {
          castedActiveComponent.edit(this.modelSelected as TopicModel);
        }

        this.onEditTopic = () => {
          this.curatingModel = true;
          castedActiveComponent.editTopic(this.modelSelected as TopicModel, this.topicSelected as Topic, () => {
            this.curatingModel = false;
          });
        }

        this.onFuseTopics = () => {
          this.curatingModel = true;
          castedActiveComponent.fuseTopics(this.modelSelected as TopicModel, () => {
            this.curatingModel = false;
          });
        }

        this.onDeleteTopics = () => {
          this.curatingModel = true;
          castedActiveComponent.deleteTopics(this.modelSelected as TopicModel, () => {
            this.curatingModel = false;
          });
        }

        this.onDeleteTopic = () => {
          this.curatingModel = true;
          castedActiveComponent.deleteTopic(this.modelSelected as TopicModel, this.topicSelected as Topic, () => {
            this.curatingModel = false;
          });
        }

        this.onSortTopics = () => {
          this.curatingModel = true;
          castedActiveComponent.sortTopics(this.modelSelected as TopicModel, () => {
            this.curatingModel = false;
          });
        }

        this.onReset = () => {
          this.topicModelReseting = true;
          castedActiveComponent.resetModel(this.modelSelected as TopicModel, () => {
            this.topicModelReseting = false;
          });
        }

        this.showSimilarTopics = () => {
          castedActiveComponent.showSimilar(this.modelSelected as TopicModel);
        }

        this.onSetLabels = () => {
          this.curatingModel = true;
          castedActiveComponent.setLabels(this.modelSelected as TopicModel, () => {
            this.curatingModel = false;
          });
        }

        break;
      }
      case activeComponent instanceof DomainModelsListingComponent: {
        const castedActiveComponent = activeComponent as DomainModelsListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onDomainModelSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.modelDetails = this._buildDomainModelDetails(model);
            this.modelSelected = model;
            this.selectedModelType = ModelType.Domain;
          }
        );

        this.onEditItem = () => {
          castedActiveComponent.edit(this.modelSelected as DomainModel);
        }

        break;
      }
    }
  }

  onDelete(): void {

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
    if ((this.modelSelected as TopicModel).hierarchyLevel === 1) {
      const parentName: string = (this.modelSelected as TopicModel).TrDtSet;
      this.topicModelService.pyLDAvisHierarchicalUrl(parentName, this.modelSelected.name).subscribe(url => {
        this.dialog.open(PyLDAComponent,
          {
            maxWidth: '80vw',
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
            maxWidth: '80vw',
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

  private _buildTopicModelDetails(model: TopicModel): DetailsItem[] {
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
        label: 'APP.MODELS-COMPONENT.MORE-DETAILS',
        value: 'APP.MODELS-COMPONENT.MORE-DETAILS-SHOW',
        button: true,
        action: () => {
          this.trainingParamsLoading = true;
          this.topicModelService.get(model.name).subscribe(response => {
            this.trainingParamsLoading = false;
            this.dialog.open(ModelDetailsComponent,
              {
                width: '90vw',
                maxWidth: '40rem',
                maxHeight: '90vh',
                disableClose: true,
                data: {
                  model: response?.items[0]
                }
              }
            )
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
        label: 'APP.MODELS-COMPONENT.TAG',
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
        label: 'APP.MODELS-COMPONENT.TYPE',
        value: (new DataTableDomainModelTypeFormatPipe(this.enumUtils)).transform(model.type)
      },
      {
        label: 'APP.MODELS-COMPONENT.TRAINED-CORPUS',
        value: '-'
      },
      {
        label: 'APP.MODELS-COMPONENT.MORE-DETAILS',
        value: '...'
      },
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