import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RunningTasksService } from '../http/running-tasks.service';

@Injectable()
export class RunningTasksQueueService {

    private _queue: RunningTaskQueueItem[] = [];
    private _finished: RunningTaskQueueItem[] = [];

    get queue(): Readonly<RunningTaskQueueItem[]> {
        return this._queue;
    }

    get finished(): Readonly<RunningTaskQueueItem[]> {
        return this._finished;
    }

    public taskCompleted: Subject<RunningTaskQueueItem> = new Subject<RunningTaskQueueItem>();

    constructor(
        private service: RunningTasksService,
    ) {
        this.initTasksUpdate();
    }

    private initTasksUpdate(): void {
        this.getRunningTasks(RunningTaskType.training);
        setInterval(() => {
            this.getRunningTasks(RunningTaskType.training);
        }, 10000);
    }

    private getRunningTasks(type: RunningTaskType): void {
        this.service.getRunningTasks(type).subscribe((response) => {
            if (type === RunningTaskType.training) this.updateTrainingItems(response.items);
        });
    }

    public updateTrainingItems(items: RunningTaskQueueItem[]): void {
        let toQueue: RunningTaskQueueItem[] = [];
        let toFinished: RunningTaskQueueItem[] = [];
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

    public removeAllItems(type: RunningTaskType, callback: () => void): void {
        this.service.clearAllFinishedTasks(type).subscribe(callback);
    }

}

export interface RunningTaskQueueItem {
    label: string;
    finished?: boolean;
    payload?: any;
    task?: string;
    type?: RunningTaskType;
    startedAt?: Date;
    finishedAt?: Date;
}

export enum RunningTaskType {
    training = 'training'
}