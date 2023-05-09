import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DocumentLookup } from '@app/core/query/document.lookup';
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
import { debounceTime, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { DomainModelSamplingEditorModel } from '../domain-model-sampling-editor.model';
import { Document } from '@app/core/model/model/domain-model.model';

@Component({
  selector: 'app-documents-listing',
  templateUrl: './documents-listing.component.html',
  styleUrls: ['./documents-listing.component.scss']
})
export class DocumentsListingComponent extends BaseListingComponent<Document, DocumentLookup> implements OnInit {
  userSettingsKey: UserSettingsKey;

  ColumnMode = ColumnMode;

  filterEditorConfiguration: FilterEditorConfiguration;
  filterFormGroup: FormGroup;
  likeFilterFormGroup: FormGroup;

  @Input("settings")
  settingsSubject: BehaviorSubject<DomainModelSamplingEditorModel> = new BehaviorSubject(undefined);
  settings: DomainModelSamplingEditorModel = undefined;
  @Output()
  onDocumentSelect = new EventEmitter<Document>();
  @Output()
  onDocumentLookup = new EventEmitter<DocumentLookup>();
  private _documentSelected = null;

  get documentSelected(): Document {
    return this._documentSelected;
  }

  get canGiveFeedback(): boolean {
    // return this.documentSelected ? true : false;
    return false;
  }

  SelectionType = SelectionType;

  @ViewChild('documents_list') table: DatatableComponent;

  protected loadListing(): Observable<QueryResult<Document>> {
    return of({
      count: 1, items: [{
        label: 0,
        id: "ID90109",
        title: "Researchers’ Night 07 at the Zurich lakeside - A celebration of European Research in Switzerland",
        text: "By submitting a proposal for the first Researchers’ Night in Switzerland, ‘lakeside zurich' intends to create a new platform to foster and deepen public dialogue on European research. The implementation of a Researchers’ Night in Switzerland is of crucial importance to the research area Switzerland. It displays European integration and is meant to raise the social and professional recognition of international researchers working in Switzerland. “lakeside zurich” will challenge and accomplish this ambitious goal. “lakeside zurich” will take place at three central locations in downtown Zurich. The sites of the event are located around the main recreation and amusement centre and can easily be reached by public transportation. A boat leaving every 15 minutes will transport passengers to and from the three fairgrounds. During the trip, scientists and artists will entertain the ferry guests. The opening is scheduled for 6pm. 10’000 visitors are expected . The aim of the event is to provide researchers, who have benefited from EU support, the possibility to present and promote their exceptional ideas to civilians with different backgrounds and of all age groups in a festive atmosphere."
      }]
    });
  }

  protected initializeLookup(): DocumentLookup {
    const lookup = new DocumentLookup();
    lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: this.ITEMS_PER_PAGE };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<Document>(x => x.label)] };
    this.updateOrderUiFields(lookup.order);

    lookup.project = {
      fields: [
        nameof<Document>(x => x.id),
        nameof<Document>(x => x.title),
        nameof<Document>(x => x.text),
        nameof<Document>(x => x.label)
      ]
    };

    return lookup;
  }
  protected setupColumns() {
    this.gridColumns.push(
      ...[
        {
          prop: nameof<Document>(x => x.label),
          sortable: true,
          resizeable: true,
          alwaysShown: true,
          maxWidth: 100,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.LABEL'
        },
        {
          prop: nameof<Document>(x => x.id),
          sortable: true,
          resizeable: true,
          alwaysShown: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.ID'
        },
        {
          prop: nameof<Document>(x => x.title),
          sortable: true,
          resizeable: true,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.TITLE'
        },
        {
          prop: nameof<Document>(x => x.text),
          sortable: true,
          resizeable: true,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.TEXT'
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
    private formBuilder: FormBuilder

  ) {
    super(router, route, uiNotificationService, httpErrorHandlingService, queryParamsService);
    this.lookup = this.initializeLookup();

    this._buildFilterEditorConfiguration();

    setTimeout(() => {
      this.setupVisibleColumns([
        nameof<Document>(x => x.label),
        nameof<Document>(x => x.id),
        nameof<Document>(x => x.title)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpFiltersFormGroup();
    this._setUpLikeFilterFormGroup();
    this.settingsSubject.subscribe(value => {
      this.settings = value;
      this.refresh();
    });
  }

  public refresh(): void {
    this._documentSelected = null;
    this.onDocumentSelect.emit(null);
    this.onDocumentLookup.emit(this.lookup);
    this.onPageLoad({ offset: 0 } as PageLoadEvent);
  }

  private _buildFilterEditorConfiguration(): void {
    this.filterEditorConfiguration = {
      items: [
        {
          key: 'label',
          type: FilterEditorFilterType.TextInput,
          placeholder: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.FILTER-OPTIONS.LABEL-PLACEHOLDER'
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
      const document: Document = $event.row as Document;
      this._documentSelected = document;
      this.onDocumentSelect.emit(document);
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

  giveFeedback(): void {
    // this.dialog.open(NewHierarchicalTopicModelComponent, {
    //   width: "80rem",
    //   maxWidth: '90vw',
    //   disableClose: true,
    //   data: {
    //     parent: this.model,
    //     topic: this._topicSelected
    //   }
    // })
    //   .afterClosed()
    //   .pipe(
    //     takeUntil(this._destroyed),
    //     filter(x => x)
    //   ).subscribe(result => {
    //     if (result) this.snackbars.operationStarted();
    //   })
  }
}
