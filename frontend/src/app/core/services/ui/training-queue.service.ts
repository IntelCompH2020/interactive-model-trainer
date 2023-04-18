import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RunningTasksService } from '../http/running-tasks.service';

@Injectable()
export class TrainingQueueService {

    private _queue: TrainingQueueItem[] = [];
    private _finished: TrainingQueueItem[] = [];

    get queue(): Readonly<TrainingQueueItem[]> {
        return this._queue;
    }

    get finished(): Readonly<TrainingQueueItem[]> {
        return this._finished;
    }

    public taskCompleted: Subject<TrainingQueueItem> = new Subject<TrainingQueueItem>();

    constructor(
        private service: RunningTasksService,
    ) {
        this.initTasksUpdate();
    }

    private initTasksUpdate(): void {
        this.service.getRunningTasks().subscribe((response) => {
            this.updateItems(response.items);
        });
        setInterval(() => {
            this.service.getRunningTasks().subscribe((response) => {
                this.updateItems(response.items);
            });
        }, 10000);
    }

    public updateItems(items: TrainingQueueItem[]): void {
        let toQueue: TrainingQueueItem[] = [];
        let toFinished: TrainingQueueItem[] = [];
        for (let item of items) {
            if (item.finished) {
                toFinished.push(item);
                // If it is finished now, push the event
                if (this._finished.findIndex(t => { 
                    return t.task === item.task;
                }) === -1) this.taskCompleted.next(item);
            } else {
                toQueue.push(item);
            }
        }
        this._queue.splice(0, this._queue.length);
        this._finished.splice(0, this._finished.length);
        this._queue.push(...toQueue);
        this._finished.push(...toFinished);
    }

    public removeItem(task: string): void {
        this._finished.forEach((_item, i) => {
            if (_item.task === task) {
                this.service.clearFinishedTask(task).subscribe(() => {
                    this._finished.splice(i, 1);
                });
            }
        });
    }

    public removeAllItems(callback: () => void): void {
        this.service.clearAllFinishedTasks().subscribe(callback);
    }

}

export interface TrainingQueueItem {
    label: string;
    finished?: boolean;
    model?: any;
    task?: string;
    startedAt?: Date;
    finishedAt?: Date;
}