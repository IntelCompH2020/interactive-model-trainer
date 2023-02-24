import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TopicModelService } from '../http/topic-model.service';
import { SnackBarCommonNotificationsService } from './snackbar-notifications.service';

@Injectable()
export class TrainingQueueService {

    private _queue: TrainingQueueItem[] = [];

    get queue(): Readonly<TrainingQueueItem[]> {
        return this._queue;
    }

    public taskCompleted: Subject<string> = new Subject<string>();

    constructor(
        private service: TopicModelService,
        private snackbars: SnackBarCommonNotificationsService
    ) {}

    public addItem(item: TrainingQueueItem): void {
        this._queue.push(item);
        let checkTimer = setInterval(() => {
            this.service.getTaskStatus(item.task).subscribe((status) => {
                if (status === "COMPLETED") {
                    this.snackbars.successfulOperation(false);
                    item.finished = true;
                    this.taskCompleted.next(item.task);
                    clearInterval(checkTimer);
                } else if (status === "ERROR") {
                    this.snackbars.notSuccessfulOperation();
                    item.finished = true;
                    this.taskCompleted.next(item.task);
                    clearInterval(checkTimer);
                }
            });
        }, 10000);
    }

    public removeItem(task: string): void {
        this._queue.forEach((_item, i) => {
            if (_item.task === task) this._queue.splice(i, 1);
        });
    }

    // public makeAllfinished(): void {
    //     this._queue.forEach(item => item.finished = true)
    // }

}

export interface TrainingQueueItem {
    label: string;
    finished?: boolean;
    model?: any;
    task?: string;
}