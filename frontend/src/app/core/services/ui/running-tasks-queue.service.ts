import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RunningTasksService } from '../http/running-tasks.service';

@Injectable({
    providedIn: 'root',
})
export class RunningTasksQueueService {

    private _queue: RunningTaskQueueItem[] = [];
    private _finished: RunningTaskQueueItem[] = [];
    private _curating: RunningTaskQueueItem[] = [];
    private _curatingFinished: RunningTaskQueueItem[] = [];

    private topicTasks: RunningTaskSubType[] = [
        RunningTaskSubType.RUN_ROOT_TOPIC_TRAINING,
        RunningTaskSubType.RUN_HIERARCHICAL_TOPIC_TRAINING,
        RunningTaskSubType.FUSE_TOPIC_MODEL,
        RunningTaskSubType.RESET_TOPIC_MODEL,
        RunningTaskSubType.SORT_TOPIC_MODEL
    ];
    private domainTasks: RunningTaskSubType[] = [
        RunningTaskSubType.RUN_ROOT_DOMAIN_TRAINING,
        RunningTaskSubType.RETRAIN_DOMAIN_MODEL,
        RunningTaskSubType.CLASSIFY_DOMAIN_MODEL,
        RunningTaskSubType.EVALUATE_DOMAIN_MODEL
    ];

    get queue(): Readonly<RunningTaskQueueItem[]> {
        return this._queue;
    }

    get finished(): Readonly<RunningTaskQueueItem[]> {
        return this._finished;
    }

    get curating(): Readonly<RunningTaskQueueItem[]> {
        return this._curating;
    }

    get curatingFinished(): Readonly<RunningTaskQueueItem[]> {
        return this._curatingFinished;
    }

    private _taskCompleted: Subject<RunningTaskQueueItem> = new Subject<RunningTaskQueueItem>();

    get taskCompleted(): Subject<RunningTaskQueueItem> {
        return this._taskCompleted;
    }

    constructor(
        private service: RunningTasksService,
    ) {
        this.initTasksUpdateInterval(RunningTaskType.training, 10000);
        this.initTasksUpdateInterval(RunningTaskType.curating, 8000);
    }

    private initTasksUpdateInterval(type: RunningTaskType, interval: number): void {
        this.loadRunningTasks(type);
        setInterval(() => {
            this.loadRunningTasks(type);
        }, interval);
    }

    public loadRunningTasks(type: RunningTaskType): void {
        this.service.getRunningTasks(type).subscribe((response) => {
            if (RunningTaskType.training === type) {
                this._updateTrainingItems(response.items);
            } else {
                this._updateCuratingItems(response.items);
            }
        });
    }

    private _updateTrainingItems(items: RunningTaskQueueItem[]): void {
        let toQueue: RunningTaskQueueItem[] = [];
        let toFinished: RunningTaskQueueItem[] = [];
        for (let item of items) {
            if (item.finished) {
                toFinished.push(item);
                // If it is finished now, push the event
                if (this._finished.findIndex(t => { 
                    return t.task === item.task;
                }) === -1) {
                    this.taskCompleted.next(item);
                }
            } else {
                toQueue.push(item);
            }
        }
        //Refresh items lists
        this._queue.splice(0, this._queue.length);
        this._finished.splice(0, this._finished.length);
        this._queue.push(...toQueue);
        this._finished.push(...toFinished);
    }

    private _updateCuratingItems(items: RunningTaskQueueItem[]): void {
        const previouslyCurating: RunningTaskQueueItem[] = this._curating;
        let toCurating: RunningTaskQueueItem[] = [];
        let toFinished: RunningTaskQueueItem[] = [];
        for (let item of items) {
            if (!item.finished) {
                toCurating.push(item);
            } else {
                toFinished.push(item);
                if (previouslyCurating.filter((i) => i.task === item.task).length) this.taskCompleted.next(item);
            }
        }
        this._curating.splice(0, this._curating.length);
        this._curating.push(...toCurating);
        this._curatingFinished.splice(0, this._curatingFinished.length);
        this._curatingFinished.push(...toFinished);
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
        this.service.clearAllFinishedTasks(type).subscribe(() => {
            if (type === RunningTaskType.training) this._finished.splice(0, this._finished.length);
            callback();
        });
    }

    public isTopicModelTask(task: RunningTaskQueueItem): boolean {
        return this.topicTasks.indexOf(task.subType) !== -1;
    }

    public isDomainModelTask(task: RunningTaskQueueItem): boolean {
        return this.domainTasks.indexOf(task.subType) !== -1;
    }

}

export interface RunningTaskQueueItem {
    label: string;
    finished?: boolean;
    payload?: any;
    task?: string;
    type?: RunningTaskType;
    subType?: RunningTaskSubType;
    startedAt?: Date;
    finishedAt?: Date;
    response?: any;
}

export enum RunningTaskType {
    training = 'training',
    curating = 'curating'
}

export enum RunningTaskSubType {
    RUN_ROOT_TOPIC_TRAINING = 'RUN_ROOT_TOPIC_TRAINING',
    RUN_HIERARCHICAL_TOPIC_TRAINING = 'RUN_HIERARCHICAL_TOPIC_TRAINING',
    RUN_ROOT_DOMAIN_TRAINING = 'RUN_ROOT_DOMAIN_TRAINING',

    RESET_TOPIC_MODEL = 'RESET_TOPIC_MODEL',
    FUSE_TOPIC_MODEL = 'FUSE_TOPIC_MODEL',
    SORT_TOPIC_MODEL = 'SORT_TOPIC_MODEL',

    RETRAIN_DOMAIN_MODEL = 'RETRAIN_DOMAIN_MODEL',
    CLASSIFY_DOMAIN_MODEL = 'CLASSIFY_DOMAIN_MODEL',
    EVALUATE_DOMAIN_MODEL = 'EVALUATE_DOMAIN_MODEL'
}