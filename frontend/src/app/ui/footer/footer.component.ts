import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { TrainingQueueItem, TrainingQueueService } from '@app/core/services/ui/training-queue.service';
import { BaseComponent } from '@common/base/base.component';
import { TrainingModelProgressComponent } from '@common/modules/training-model-progress/training-model-progress.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends BaseComponent implements OnInit {

  trainingModels: Readonly<TrainingQueueItem[]>;

  constructor(
    private trainingModelQueueService: TrainingQueueService,
    protected modelSelecrionService: ModelSelectionService,
    private dialog: MatDialog
  ) {
    super();
    this.trainingModels = this.trainingModelQueueService.queue;
  }

  ngOnInit(): void {
    this.trainingModelQueueService.taskCompleted.subscribe((task) => {
      let openedDialog = this.dialog.getDialogById(task);
      if (openedDialog) (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask();
      else {
        for (let item of this.trainingModelQueueService.queue) {
          if (item.task === task) {
            // this.openTrainingDialog(item.model, item.task);
            // let openedDialog = this.dialog.getDialogById(task);
            // if (openedDialog) (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask();
            return;
          }
        }
      }
    });
  }


  // makeAllFinished(): void {
  //   this.trainingModelQueueService.makeAllfinished();
  // }

  openTrainingDialog(item: TrainingQueueItem): void {
    let openedDialog = this.dialog.open(TrainingModelProgressComponent, {
      id: item.task,
      minWidth: '80vw',
      disableClose: true,
      data: {
        model: item.model,
        task: item.task
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
        this.trainingModelQueueService.taskCompleted.next("__REFRESH__");
      }
    })
    if (item.finished) {
      (openedDialog.componentInstance as TrainingModelProgressComponent).finishTask();
    }
  }

}
