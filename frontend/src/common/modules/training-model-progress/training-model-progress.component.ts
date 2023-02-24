import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-training-model-progress',
  templateUrl: './training-model-progress.component.html',
  styleUrls: ['./training-model-progress.component.scss']
})
export class TrainingModelProgressComponent implements OnInit, OnDestroy {

  runningTime = '00:00:00';
  epochTime = '00:00:00';
  progressPercent = '10';
  progressInfo = 'Connecting with the training service...';

  logTimerId: any;

  taskFinished: boolean = false;

  scroll: Subject<number> = new Subject<number>();
  scrollHeight: number = 0;

  private _details: {}[] = [];
  private _summaries: {}[] = [];

  @ViewChild('logsConsole') protected scrollConsoleElement: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<TrainingModelProgressComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modelService: TopicModelService
  ) { }

  ngOnInit(): void {
    this._populateDetails();
    this._populateSummaries();

    this.logTimerId = setInterval(() => {
      if (this.model.parentName) {
        this.modelService.getHierarchicalTrainLogs(this.model.parentName, this.model.name)
        .subscribe(result => {
          let _logs = "";
          for (let line of result) {
            _logs += line + "\n";
          }
          if (_logs !== "" && !this.taskFinished) this.progressInfo = _logs;
          setTimeout(() => {
            this.scroll.next(this.scrollConsoleElement?.nativeElement.scrollHeight);
          }, 0);
        },
          (error: any) => {
            console.error(error);
          })
      } else {
        this.modelService.getTrainLogs(this.model.name)
        .subscribe(result => {
          let _logs = "";
          for (let line of result) {
            _logs += line + "\n";
          }
          if (_logs !== "" && !this.taskFinished) this.progressInfo = _logs;
          setTimeout(() => {
            this.scroll.next(this.scrollConsoleElement?.nativeElement.scrollHeight);
          }, 0);
        },
          (error: any) => {
            console.error(error);
          })
      }
      
    }, 5000);

    this.scroll.subscribe((scroll) => {
      this.scrollHeight = scroll;
    })

  }

  ngOnDestroy(): void {
    clearInterval(this.logTimerId);
  }

  private _populateDetails() {
    this._details = [
      {
        label: 'Training model',
        value: this.model.name
      },
      {
        label: 'Type',
        value: this.model.type
      },
      {
        label: 'Topics',
        value: this.model.parameters['TM.ntopics']
      },
      {
        label: 'Corpus',
        value: this.model.corpusId
      },
      // {
      //   label: 'Train size',
      //   value: '20308'
      // },
      // {
      //   label: 'Validation size',
      //   value: '9129'
      // },
      // {
      //   label: 'Batch size',
      //   value: '8'
      // },
    ];
  }

  private _populateSummaries(): void {
    this._summaries = [
      {
        label: 'Epoch',
        value: '-'
      },
      {
        label: 'Step',
        value: '-'
      },
      {
        label: 'Train Loss',
        value: '-',
      },
      {
        label: 'Validation Loss',
        value: '-'
      },
      {
        label: 'Best epoch',
        value: '-'
      }
    ];
  }

  finishTask(): void {
    clearInterval(this.logTimerId);
    this.progressInfo += "\n\n------Training task completed.------";
    this.progressPercent = "100";
    this.taskFinished = true;
  }

  finish(): void {
    this.dialogRef.close(false);
  }
  hide(): void {
    this.dialogRef.close(true);
  }

  get model() {
    return this.data.model;
  }

  get details() {
    return this._details;
  }

  get summaries() {
    return this._summaries;
  }

}