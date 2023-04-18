import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { RawCorpus } from '@app/core/model/corpus/raw-corpus.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { SnackBarCommonNotificationsService } from '@app/core/services/ui/snackbar-notifications.service';
import { BaseComponent } from '@common/base/base.component';
import { PipeService } from '@common/formatting/pipe.service';
import { DataTableDateTimeFormatPipe } from '@common/formatting/pipes/date-time-format.pipe';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LogicalCorpusListingComponent } from './logical-corpus-listing/logical-corpus-listing.component';
import { RawCorpusListingComponent } from './raw-corpus-listing/raw-corpus-listing.component';

@Component({
  selector: 'app-corpus',
  templateUrl: './corpus.component.html',
  styleUrls: ['./corpus.component.css']
})
export class CorpusComponent extends BaseComponent implements OnInit {

  corpusSelected: RawCorpus | LogicalCorpus;

  selectedCorpusType: CorpusType;
  CorpusType = CorpusType;
  modelSelectionSubscription: Subscription;

  details: ItemDetail[] = []

  private onRefresh: () => void;
  private onEditItem: () => void;
  private onExportItem: () => void;

  constructor(
    private dialog: MatDialog,
    private language: TranslateService,
    protected snackbars: SnackBarCommonNotificationsService,
    private logicalCorpusService: LogicalCorpusService,
    private pipeService: PipeService
  ) {
    super();
  }

  ngOnInit(): void { }

  protected onEdit(): void {
    this.onEditItem?.();
  }

  protected onExport(): void {
    this.onExportItem?.();
  }

  onOutletActivate(activeComponent: Component): void {

    if (this.modelSelectionSubscription) {
      this.modelSelectionSubscription.unsubscribe();
      this.modelSelectionSubscription = null;
    }
    this.corpusSelected = null;
    this.selectedCorpusType = null;
    this.details = [];
    this.onRefresh = null;
    this.onEditItem = null;
    this.onExportItem = null;

    switch (true) {
      case activeComponent instanceof RawCorpusListingComponent: {
        const castedActiveComponent = activeComponent as RawCorpusListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onCorpusSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            this.corpusSelected = model;
            this.selectedCorpusType = CorpusType.Raw;
            if (model) this.details = this._buildRawCorpusDetails(model);
          }
        )
        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onExportItem = () => {
          castedActiveComponent.export(this.corpusSelected as RawCorpus);
        }
        break;
      }
      case activeComponent instanceof LogicalCorpusListingComponent: {
        const castedActiveComponent = activeComponent as LogicalCorpusListingComponent;

        this.modelSelectionSubscription = castedActiveComponent.onCorpusSelect.pipe(
          takeUntil(this._destroyed)
        ).subscribe(
          model => {
            this.corpusSelected = model;
            this.selectedCorpusType = CorpusType.Logical;
            if (model) this.details = this._buildLogicalCorpusDetails(model);
          }
        )
        this.onRefresh = () => {
          castedActiveComponent.refresh();
        }

        this.onEditItem = () => {
          castedActiveComponent.edit(this.corpusSelected as LogicalCorpus);
        }

        this.onExportItem = () => {
          castedActiveComponent.export(this.corpusSelected as LogicalCorpus);
        }
        break;
      }
    }

  }

  private _buildRawCorpusDetails(corpus: RawCorpus): ItemDetail[] {
    if (!corpus) return [];
    return [
      {
        label: 'APP.CORPUS-COMPONENT.NAME',
        value: corpus.name || '-',
      },
      {
        label: 'APP.CORPUS-COMPONENT.DESCRIPTION',
        value: corpus.description || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.RAW.RECORDS',
        value: corpus.records || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.RAW.SOURCE',
        value: corpus.source || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.RAW.DOWNLOAD-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(corpus.download_date) || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.VISIBILITY',
        value: corpus.visibility || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.TYPE',
        value: CorpusType.Raw,
      },
      {
        label: 'APP.CORPUS-COMPONENT.MORE-DETAILS',
        value: '...',
      },
    ];
  }

  private _buildLogicalCorpusDetails(corpus: LogicalCorpus): ItemDetail[] {
    if (!corpus) return [];
    return [
      {
        label: 'APP.CORPUS-COMPONENT.NAME',
        value: corpus.name || '-',
      },
      {
        label: 'APP.CORPUS-COMPONENT.DESCRIPTION',
        value: corpus.description || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.LOGICAL.CREATION-DATE',
        value: this.pipeService.getPipe<DataTableDateTimeFormatPipe>(DataTableDateTimeFormatPipe).withFormat('short').transform(corpus.creation_date) || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.LOGICAL.CREATOR',
        value: corpus.creator || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.VISIBILITY',
        value: corpus.visibility || '-'
      },
      {
        label: 'APP.CORPUS-COMPONENT.TYPE',
        value: CorpusType.Logical,
      },
      {
        label: 'APP.CORPUS-COMPONENT.LOGICAL.VALID-FOR',
        value: corpus.valid_for ? this.language.instant('APP.CORPUS-COMPONENT.LOGICAL.VALID-FOR-OPTIONS.'+corpus.valid_for) : 'N/A'
      },
      {
        label: 'APP.CORPUS-COMPONENT.MORE-DETAILS',
        value: '...',
      },
    ];
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

          switch (this.selectedCorpusType) {

            case CorpusType.Raw: {
              break;
            }
            case CorpusType.Logical: {
              this.logicalCorpusService.delete(this.corpusSelected.name)
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

enum CorpusType {
  Raw = 'raw',
  Logical = 'logical'
}

interface ItemDetail {
  label: string;
  value: any;
}