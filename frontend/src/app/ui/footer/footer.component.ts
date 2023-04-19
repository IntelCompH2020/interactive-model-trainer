import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RunningTaskQueueItem, RunningTaskType, RunningTasksQueueService } from '@app/core/services/ui/running-tasks-queue.service';
import { BaseComponent } from '@common/base/base.component';
import { TrainingModelProgressComponent } from '@common/modules/training-model-progress/training-model-progress.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends BaseComponent implements OnInit {

  clearingFinished: boolean = false;

  get trainingModels(): Readonly<RunningTaskQueueItem[]> {
    return this.trainingModelQueueService.queue;
  };

  get finishedModels(): Readonly<RunningTaskQueueItem[]> {
    return this.trainingModelQueueService.finished;
  };

  constructor(
    private trainingModelQueueService: RunningTasksQueueService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.trainingModelQueueService.taskCompleted.subscribe((task) => {
      let openedDialog = this.dialog.getDialogById(task.task);
      if (openedDialog) (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask(task);
      else {
        // for (let item of this.trainingModelQueueService.queue) {
        //   if (item.task === task) {
        //     this.openTrainingDialog(item.model, item.task);
        //     let openedDialog = this.dialog.getDialogById(task);
        //     if (openedDialog) (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask();
        //     return;
        //   }
        // }
      }
    });
  }


  clearAllFinished(): void {
    this.clearingFinished = true;
    this.trainingModelQueueService.removeAllItems(RunningTaskType.training, () => {});
  }

  openTrainingDialog(item: RunningTaskQueueItem): void {
    this.clearingFinished = false;
    let openedDialog = this.dialog.open(TrainingModelProgressComponent, {
      id: item.task,
      minWidth: "80vw",
      maxWidth: "90vw",
      disableClose: true,
      data: {
        item
      }
    });
    openedDialog.afterClosed()
      .pipe(
        takeUntil(this._destroyed)
      )
      .subscribe((response) => {
        //If the response is true, the user just hides the dialog
        if (!response) {
          this.trainingModelQueueService.removeItem(item.task);
          this.trainingModelQueueService.taskCompleted.next(item);
        }
      })
    if (item.finished) {
      (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask(item);
    }
  }

}
