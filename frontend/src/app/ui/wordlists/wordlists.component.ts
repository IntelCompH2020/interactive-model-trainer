import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { StopwordsAndEquivalenciesComponent } from './stopwords-and-equivalencies/stopwords-and-equivalencies.component';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { StopwordsListingComponent } from './stopwords-and-equivalencies/stopwords-listing/stopwords-listing.component';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { PipeService } from '@common/formatting/pipe.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';

@Component({
  selector: 'app-wordlists',
  templateUrl: './wordlists.component.html',
  styleUrls: ['./wordlists.component.css']
})
export class WordListsComponent extends BaseComponent implements OnInit {

  modelSelected: Keyword | Stopword | Equivalence;
  selectedModelType: AvailableModelsType = AvailableModelsType.None;

  modelSelectionSubscription: Subscription;

  itemDetails: ItemDetail[]

  private onRefresh: () => void;
  private onEditItem: () => void;

  constructor(
    private keywordService: KeywordService,
    private dialog: MatDialog,
    private language: TranslateService,
    protected snackbars: SnackBarCommonNotificationsService,
    private stopwordService: StopwordService,
    private equivalenceService: EquivalenceService,
    private pipeService: PipeService
  ) {
    super();
  }

  ngOnInit(): void {}

  protected onEdit(): void {
    this.onEditItem?.();
  }

  protected onOutletActivate(activeComponent: Component): void {

    if (this.modelSelectionSubscription) {
      this.modelSelectionSubscription.unsubscribe();
      this.modelSelectionSubscription = null;
    }
    this.modelSelected = null;
    this.selectedModelType = AvailableModelsType.None;
    this.itemDetails = [];

    this.onRefresh = null;
    this.onEditItem = null;
    switch (true) {
      case activeComponent instanceof KeywordsListingComponent: {
        const castedActiveComponent = activeComponent as KeywordsListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onKeywordSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Keyword;
            if (model) this.itemDetails = this._buildKeywordFields(model);
          }
        )
        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onEditItem = () => {
          castedActiveComponent.edit(this.modelSelected as Keyword);
        }
        break;
      }
      case activeComponent instanceof StopwordsAndEquivalenciesComponent: {

        const castedActiveComponent = activeComponent as StopwordsAndEquivalenciesComponent;

        this.modelSelectionSubscription = castedActiveComponent.onStopwordSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Stopword;
            if (model) this.itemDetails = this._buildStopWordFields(model);
          }
        );

        this.modelSelectionSubscription = castedActiveComponent.onEquivalenceSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Equivalence;
            if (model) this.itemDetails = this._buildEquivalenceFields(model);
          }
        );

        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }
        this.onEdit = () => {
          castedActiveComponent.edit(this.modelSelected as (Stopword | Equivalence));
        }
        break;
      }
    }
  }

  private _buildKeywordFields(item: Keyword): ItemDetail[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date)
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: '...'
      },
    ]
  }
  private _buildStopWordFields(item: Stopword): ItemDetail[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date)
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: '...'
      },
    ]
  }
  private _buildEquivalenceFields(item: Equivalence): ItemDetail[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date)
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: '...'
      },
    ]
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

            case AvailableModelsType.Keyword: {

              this.keywordService.delete(this.modelSelected.name)
                .pipe(takeUntil(
                  this._destroyed
                ))
                .subscribe(_response => {
                  this.snackbars.successfulDeletion();
                  this.onRefresh?.();
                })
              break;
            }
            case AvailableModelsType.Stopword: {

              this.stopwordService.delete(this.modelSelected.name)
                .pipe(takeUntil(
                  this._destroyed
                ))
                .subscribe(_response => {
                  this.snackbars.successfulDeletion();
                  this.onRefresh?.();
                })
              break;
            }
            case AvailableModelsType.Equivalence: {

              this.equivalenceService.delete(this.modelSelected.name)
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
}



interface ItemDetail {
  label: string;
  value: any;
}

enum AvailableModelsType {
  None,
  Keyword,
  Equivalence,
  Stopword
}