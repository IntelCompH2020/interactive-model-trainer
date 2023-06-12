import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { KeywordsListingComponent } from './keywords/keywords-listing.component';
import { StopwordsAndEquivalencesComponent } from './stopwords-and-equivalences/stopwords-and-equivalences.component';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { PipeService } from '@common/formatting/pipe.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { WordlistDetailsComponent } from './wordlist-details/wordlist-details.component';

@Component({
  selector: 'app-wordlists',
  templateUrl: './wordlists.component.html',
  styleUrls: ['./wordlists.component.css']
})
export class WordListsComponent extends BaseComponent implements OnInit {

  modelSelected: Keyword | Stopword | Equivalence;
  selectedModelType: AvailableModelsType = AvailableModelsType.None;

  modelSelectionSubscription: Subscription;

  itemDetails: DetailsItem[];

  private onRefresh: () => void;
  private onRenameItem: () => void;
  private onUpdateItem: () => void;
  private onCopyItem: () => void;

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

  protected onEdit(updateAll: boolean = false): void {
    if (updateAll) this.onUpdateItem?.();
    else this.onRenameItem?.();
  }

  protected onCopy(): void {
    this.onCopyItem?.();
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
    this.onRenameItem = null;
    this.onUpdateItem = null;
    this.onCopyItem = null;
    switch (true) {
      case activeComponent instanceof KeywordsListingComponent: {
        const castedActiveComponent = activeComponent as KeywordsListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onKeywordSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.itemDetails = this._buildKeywordFields(model);
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Keyword;
          }
        )
        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onRenameItem = () => {
          castedActiveComponent.edit(this.modelSelected as Keyword);
        }

        this.onUpdateItem = () => {
          castedActiveComponent.edit(this.modelSelected as Keyword, true);
        }

        this.onCopyItem = () => {
          castedActiveComponent.copy(this.modelSelected as Keyword);
        }

        break;
      }
      case activeComponent instanceof StopwordsAndEquivalencesComponent: {

        const castedActiveComponent = activeComponent as StopwordsAndEquivalencesComponent;

        this.modelSelectionSubscription = castedActiveComponent.onStopwordSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.itemDetails = this._buildStopWordFields(model);
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Stopword;
          }
        );

        this.modelSelectionSubscription = castedActiveComponent.onEquivalenceSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            if (model) this.itemDetails = this._buildEquivalenceFields(model);
            this.modelSelected = model;
            this.selectedModelType = AvailableModelsType.Equivalence;
          }
        );

        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onRenameItem = () => {
          castedActiveComponent.edit(this.modelSelected as (Stopword | Equivalence));
        }

        this.onUpdateItem = () => {
          castedActiveComponent.edit(this.modelSelected as (Stopword | Equivalence), true);
        }

        this.onCopyItem = () => {
          castedActiveComponent.copy(this.modelSelected as (Stopword | Equivalence));
        }

        break;
      }
    }
  }

  private _buildKeywordFields(item: Keyword): DetailsItem[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date) || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.VISIBILITY',
        value: item.visibility || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS-SHOW',
        button: true,
        action: () => {
          this.dialog.open(WordlistDetailsComponent,
            {
              width: '60rem',
              maxWidth: "90vw",
              maxHeight: '90vh',
              disableClose: true,
              data: {
                wordlist: item
              }
            }
          );
        }
      }
    ]
  }

  private _buildStopWordFields(item: Stopword): DetailsItem[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date) || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.VISIBILITY',
        value: item.visibility || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS-SHOW',
        button: true,
        action: () => {
          this.dialog.open(WordlistDetailsComponent,
            {
              width: '60rem',
              maxWidth: "90vw",
              maxHeight: '90vh',
              disableClose: true,
              data: {
                wordlist: item
              }
            }
          );
        }
      }
    ]
  }
  
  private _buildEquivalenceFields(item: Equivalence): DetailsItem[] {
    if (!item) return [];
    return [
      {
        label: 'APP.WORD-LIST-COMPONENT.NAME',
        value: item.name || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.DESCRIPTION',
        value: item.description || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(item.creation_date) || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.CREATOR',
        value: item.creator || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.LOCATION',
        value: item.location || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.VISIBILITY',
        value: item.visibility || '-'
      },
      {
        label: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS',
        value: 'APP.WORD-LIST-COMPONENT.MORE-DETAILS-SHOW',
        button: true,
        action: () => {
          this.dialog.open(WordlistDetailsComponent,
            {
              width: '60rem',
              maxWidth: "90vw",
              maxHeight: '90vh',
              disableClose: true,
              data: {
                wordlist: item
              }
            }
          );
        }
      }
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

enum AvailableModelsType {
  None,
  Keyword,
  Equivalence,
  Stopword
}