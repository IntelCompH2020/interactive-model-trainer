import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
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
import { SelectionType } from '@swimlane/ngx-datatable';
import { UserSettingsKey } from '@user-service/core/model/user-settings.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { Document, DomainModel } from '@app/core/model/model/domain-model.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';

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

  @Input("model")
  model: DomainModel;
  @Input("documents")
  documentsSubject: BehaviorSubject<Document[]> = new BehaviorSubject([]);
  documents: Document[] = [];
  @Output()
  onDocumentSelect = new EventEmitter<Document>();
  @Output()
  onDocumentLookup = new EventEmitter<DocumentLookup>();
  @Output()
  onFeedbackSubmitted = new EventEmitter<boolean>();
  private _documentSelected = null;
  private _updatedLabels: any;

  get documentSelected(): Document {
    return this._documentSelected;
  }

  get canGiveFeedback(): boolean {
    return !!this._updatedLabels && !!this.model?.name;
  }

  SelectionType = SelectionType;

  @ViewChild('labelCell', { static: true }) labelCell: TemplateRef<any>;

  protected loadListing(): Observable<QueryResult<Document>> {
    return of({
      count: this.documents.length,
      items: this.documents.slice(this.lookup.page.offset, Math.min(this.lookup.page.offset + this.lookup.page.size, this.documents.length))
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
        nameof<Document>(x => x.index),
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
          prop: nameof<Document>(x => x.id),
          sortable: true,
          resizeable: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.ID'
        },
        {
          cellTemplate: this.labelCell,
          sortable: true,
          resizeable: true,
          alwaysShown: true,
          maxWidth: 100,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.LABEL'
        },
        {
          prop: nameof<Document>(x => x.index),
          sortable: true,
          resizeable: true,
          alwaysShown: true,
          maxWidth: 150,
          languageName: 'APP.MODELS-COMPONENT.DOCUMENTS-LISTING-COMPONENT.INDEX'
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
    private domainModelService: DomainModelService,
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
        nameof<Document>(x => x.index),
        nameof<Document>(x => x.text)
      ]);
    }, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setUpFiltersFormGroup();
    this._setUpLikeFilterFormGroup();
    this.documentsSubject.subscribe(docs => {
      this.documents = docs;
      this.refresh();
    });
  }

  public refresh(): void {
    this._documentSelected = null;
    this.onDocumentSelect.emit(null);
    this.onDocumentLookup.emit(this.lookup);
    this._updatedLabels = {};
    for (let doc of this.documents) {
      this._updatedLabels['index' + doc.index.toString()] = doc.label;
    }
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

  onLabelChange(event: Event, row: Document, value) {
    event.preventDefault();
    this.documents[this.documents.indexOf(row)].label = value;
    this._updatedLabels['index' + row.index.toString()] = value;
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
    if (!this._updatedLabels) return;
    const data = {
      labels: this._updatedLabels
    }
    this.domainModelService.giveFeedback(data, this.model.name).subscribe((res) => {
      this.snackbars.operationStarted();
      this.onFeedbackSubmitted.emit(true);
    });
  }
}
