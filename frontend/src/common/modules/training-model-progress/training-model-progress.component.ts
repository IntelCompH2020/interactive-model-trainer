import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DomainModelService } from '@app/core/services/http/domain-model.service';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { RunningTaskQueueItem } from '@app/core/services/ui/running-tasks-queue.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-training-model-progress',
  templateUrl: './training-model-progress.component.html',
  styleUrls: ['./training-model-progress.component.scss']
})
export class TrainingModelProgressComponent implements OnInit, OnDestroy {

  runningTime = '--:--:--';
  progressPercent = '10';
  progressInfo: SafeHtml = 'Connecting with the training service...';

  logTimerId: any;
  clockUpdateTimerId: any;

  taskFinished: boolean = false;
  finishedTask: RunningTaskQueueItem = undefined;

  scroll: Subject<number> = new Subject<number>();
  scrollHeight: number = 0;

  private _details: {}[] = [];
  private _summaries: {}[] = [];

  get trainingItem(): RunningTaskQueueItem {
    return this.finishedTask || this.data.item as RunningTaskQueueItem;
  }

  get model() {
    return this.trainingItem.payload;
  }

  get startedAt() {
    return this.trainingItem.startedAt;
  }

  get finishedAt() {
    return this.trainingItem.finishedAt;
  }

  get details() {
    return this._details;
  }

  get summaries() {
    return this._summaries;
  }

  @ViewChild('logsConsole') protected scrollConsoleElement: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<TrainingModelProgressComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private topicModelService: TopicModelService,
    private domainModelService: DomainModelService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this._populateDetails();
    this._populateSummaries();

    this.logTimerId = setInterval(() => {
      if (this.model.TMparam) {
        if (this.model.parentName) {
          this.topicModelService.getHierarchicalTrainLogs(this.model.parentName, this.model.name)
            .subscribe(result => {
              if (this.taskFinished) {
                clearInterval(this.logTimerId);
              }
              this._updateLogs(result);
            },
              (error: any) => {
                this.progressInfo = error.error[0];
                clearInterval(this.logTimerId);
              });
        } else {
          this.topicModelService.getTrainLogs(this.model.name)
            .subscribe(result => {
              if (this.taskFinished) {
                clearInterval(this.logTimerId);
              }
              this._updateLogs(result);
            },
              (error: any) => {
                this.progressInfo = error.error[0];
                clearInterval(this.logTimerId);
              });
        }
      } else {
        this.domainModelService.getTrainLogs(this.model.name)
            .subscribe(result => {
              if (this.taskFinished) {
                clearInterval(this.logTimerId);
              }
              this._updateLogs(result);
            },
              (error: any) => {
                this.progressInfo = error.error[0];
                clearInterval(this.logTimerId);
              });
      }

    }, 5000);

    this.clockUpdateTimerId = setInterval(() => {
      if (this.taskFinished && this.finishedAt) {
        clearInterval(this.clockUpdateTimerId);
        const timePassed: number = new Date(this.finishedAt).valueOf() - new Date(this.startedAt).valueOf();
        const timePassedInSeconds = timePassed / 1000;
        this.runningTime = this._extractTimeString(Math.floor(timePassedInSeconds));
      } else {
        const now: Date = new Date();
        const timePassed: number = now.valueOf() - new Date(this.startedAt).valueOf();
        const timePassedInSeconds = timePassed / 1000;
        this.runningTime = this._extractTimeString(Math.floor(timePassedInSeconds));
      }
    }, 1000);

    this.scroll.subscribe((scroll) => {
      this.scrollHeight = scroll;
    });
  }

  private _updateLogs(result: any): void {
    this.progressInfo = "";
    let _logs = "";
    for (let line of result) {
      _logs += line + "<br>";
    }
    if (_logs !== "") this.progressInfo = this.sanitizer.bypassSecurityTrustHtml(_logs);
    setTimeout(() => {
      this.scroll.next(this.scrollConsoleElement?.nativeElement.scrollHeight);
    }, 0);
  }

  private _extractTimeString(time: number): string {
    var hours: any = Math.floor(time / 3600);
    var minutes: any = Math.floor((time - (hours * 3600)) / 60);
    var seconds: any = Math.floor(time - (hours * 3600) - (minutes * 60));

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    var timeString = hours + ':' + minutes + ':' + seconds;
    return timeString;
  }

  ngOnDestroy(): void {
    clearInterval(this.logTimerId);
  }

  private _populateDetails() {
    if (this.model.TMparam) {
      this._details = [
        {
          label: 'Training model',
          value: this.model.name || '-'
        },
        {
          label: 'Trainer',
          value: this.model.trainer || '-'
        },
        {
          label: 'Topics',
          value: this.model.TMparam['ntopics'] || '-'
        },
        {
          label: 'Training dataset',
          value: this.model.TrDtSet || '-'
        },
        {
          label: 'Hierarchy level',
          value: this.model['hierarchy-level'] === undefined ? '-' : this.model['hierarchy-level']
        }
      ];
    } else {
      this._details = [
        {
          label: 'Model name',
          value: this.model.name || '-'
        },
        {
          label: 'Training dataset',
          value: this.model.corpus?.replace("/data/datasets/", "").replace(".json", "") || '-'
        }
      ];
    }
    
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

  finishTask(task: RunningTaskQueueItem): void {
    if (!this.taskFinished) {
      clearInterval(this.logTimerId);
      this.finishedTask = task;
      this.progressInfo += "<br>------Training task completed.------";
      this.progressPercent = "100";
      this.taskFinished = true;
    }
  }

  finish(): void {
    this.dialogRef.close(false);
  }
  hide(): void {
    this.dialogRef.close(true);
  }

}