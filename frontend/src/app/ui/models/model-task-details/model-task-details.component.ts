import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AppEnumUtils } from "@app/core/formatting/enum-utils.service";
import { RunningTaskQueueItem } from "@app/core/services/ui/running-tasks-queue.service";

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-model-task-details-modal',
  templateUrl: './model-task-details.component.html',
  styleUrls: ['./model-task-details.component.scss']
})
export class ModelTaskDetailsComponent implements OnInit {

  logsHtml: SafeHtml;
  private _selectedItem: RunningTaskQueueItem;

  get logs(): string[] {
    return this._selectedItem?.response;
  }

  get items(): RunningTaskQueueItem[] {
    return this.data;
  }

  isSelected(item: RunningTaskQueueItem): boolean {
    return this._selectedItem?.task === item.task;
  }

  constructor(
    private dialogRef: MatDialogRef<ModelTaskDetailsComponent>,
    protected language: TranslateService,
    private sanitizer: DomSanitizer,
    protected enumUtils: AppEnumUtils,
    @Inject(MAT_DIALOG_DATA) private data: RunningTaskQueueItem[]
  ) { }

  ngOnInit(): void { }

  close(): void {
    this.dialogRef.close(true);
  }

  selectItem(item: RunningTaskQueueItem) {
    this._selectedItem = item;
    this._updateLogs();
  }

  getDuration(item: RunningTaskQueueItem) {
    return (new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()) / 1000;
  }

  private _updateLogs(): void {
    this.logsHtml = "";
    let _logs = "";
    for (let line of this.logs) {
      _logs += line + "<br>";
    }
    if (_logs !== "") this.logsHtml = this.sanitizer.bypassSecurityTrustHtml(_logs);
  }

}