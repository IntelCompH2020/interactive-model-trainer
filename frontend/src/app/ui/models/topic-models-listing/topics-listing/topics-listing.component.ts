import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { Topic, TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicLookup } from '@app/core/query/topic.lookup';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { BaseListingComponent } from '@common/base/base-listing-component';
import { QueryResult } from '@common/model/query-result';
import { HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { FilterEditorConfiguration, FilterEditorFilterType } from '@common/modules/listing/filter-editor/filter-editor.component';
import { ColumnMode, PageLoadEvent, RowActivateEvent } from '@common/modules/listing/listing.component';
import { UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { NewHierarchicalTopicModelComponent } from '../new-hierarchical-topic-model/new-hierarchical-topic-model.component';

@Component({
  selector: 'app-topics-listing',
  templateUrl: './topics-listing.component.html',
  styleUrls: ['./topics-listing.component.scss']
})
export class TopicsListingComponent extends BaseListingComponent<Topic, TopicLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  ColumnMode = ColumnMode;

  filterEditorConfiguration: FilterEditorConfiguration;
  filterFormGroup: FormGroup;
  likeFilterFormGroup: FormGroup;

  @Input("model")
  modelSubject: BehaviorSubject<TopicModel> = new BehaviorSubject(undefined);
  model: TopicModel = undefined;
  @Input("parentModelCurating")
  parentModelCurating: boolean = false;
  @Output()
  onTopicSelect = new EventEmitter<Topic>();
  @Output()
  onTopicLookup = new EventEmitter<TopicLookup>();
  private _topicSelected = null;

  get topicSelected(): Topic {
    return this._topicSelected;
  }

  get canCreateSubmodel(): boolean {
    return !this.parentModelCurating && this.topicSelected && this.model.hierarchyLevel == 0;
  }

  SelectionType = SelectionType;

  @ViewChild('topics_list') table: DatatableComponent;

  protected loadListing(): Observable<QueryResult<Topic>> {
    if (this.model) return this.topicModelService.queryTopics(this.model.name, this.lookup);
    else return of({ count: 0, items: [] });
  }

  protected initializeLookup(): TopicLookup {
    const lookup = new TopicLookup();
    lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<Topic>(x => x.label)] };
    this.updateOrderUiFields(lookup.order);

    lookup.project = {
      fields: [
        nameof<Topic>(x => x.id),
        nameof<Topic>(x => x.size),
        nameof<Topic>(x => x.label),
        nameof<Topic>(x => x.wordDescription),
        nameof<Topic>(x => x.docsActive),
        nameof<Topic>(x => x.topicCoherence),
        nameof<Topic>(x => x.topicEntropy)
      ]
    };

    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(
      ...[
        {
          prop: nameof<Topic>(x => x.id),
          sortable: true,
          resizeable: true,
          alwaysShown: true,
          maxWidth: 50,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.ID'
        },
        {
          prop: nameof<Topic>(x => x.size),
          sortable: true,
          resizeable: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.SIZE'
        },
        {
          prop: nameof<Topic>(x => x.label),
          sortable: true,
          resizeable: true,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.LABEL'
        },
        {
          prop: nameof<Topic>(x => x.wordDescription),
          sortable: false,
          resizeable: true,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.WORD-DESCRIPTION'
        },
        {
          prop: nameof<Topic>(x => x.docsActive),
          sortable: true,
          resizeable: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.DOCS-ACTIVE'
        },
        {
          prop: nameof<Topic>(x => x.topicEntropy),
          sortable: true,
          resizeable: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.ENTROPY'
        },
        {
          prop: nameof<Topic>(x => x.topicCoherence),
          sortable: true,
          resizeable: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.COHERENCE'
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
    protected topicModelService: TopicModelService,
    private formBuilder: FormBuilder

  ) {
    super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
    this.lookup = this.initializeLookup();

    this._buildFilterEditorConfiguration();

    setTimeout(() => {
      this.setupVisibleColumns([
        nameof<Topic>(x => x.size),
        nameof<Topic>(x => x.label),
        nameof<Topic>(x => x.wordDescription),
        nameof<Topic>(x => x.docsActive)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpFiltersFormGroup();
    this._setUpLikeFilterFormGroup();
    this.modelSubject.subscribe(value => {
      this.model = value;
      this.refresh();
    });
  }

  public refresh(): void {
    this._topicSelected = null;
    this.onTopicSelect.emit(null);
    this.onTopicLookup.emit(this.lookup);
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  private _buildFilterEditorConfiguration(): void {
    this.filterEditorConfiguration = {
      items: [
        {
          key: 'wordDescription',
          type: FilterEditorFilterType.TextInput,
          placeholder: 'APP.MODELS-COMPONENT.TOPICS-LISTING-COMPONENT.FILTER-OPTIONS.WORD-DESCRIPTION-PLACEHOLDER'
        }
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
  }

  onRowActivated($event: RowActivateEvent) {
    if ($event.type === 'click') {
      const topic: Topic = $event.row as Topic;
      this._topicSelected = topic;
      this.onTopicSelect.emit(topic);
    }
  }

  alterPage(event: PageLoadEvent) {
    if (event) {
      this.lookup.page.offset = event.offset * this.lookup.page.size;
      this.onPageLoad({ offset: event.offset } as PageLoadEvent);
    } else {
      this.lookup.page.offset = 0;
      this.onPageLoad({ offset: 0 } as PageLoadEvent);
    }
  }

  addNewTopicSubModel(): void {
    this.dialog.open(NewHierarchicalTopicModelComponent, {
      width: "80rem",
      maxWidth: '90vw',
      disableClose: true,
      data: {
        parent: this.model,
        topic: this._topicSelected
      }
    })
      .afterClosed()
      .pipe(
        takeUntil(this._destroyed),
        filter(x => x)
      ).subscribe(result => {
        if (result) this.snackbars.operationStarted();
      })
  }
}
