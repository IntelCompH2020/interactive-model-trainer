import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { AppEnumUtils } from "@app/core/formatting/enum-utils.service";
import { RunningTaskQueueItem, RunningTaskSubType } from "@app/core/services/ui/running-tasks-queue.service";
import { InstallationConfigurationService } from "@common/installation-configuration/installation-configuration.service";

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-model-task-details-modal',
  templateUrl: './model-task-details.component.html',
  styleUrls: ['./model-task-details.component.scss']
})
export class ModelTaskDetailsComponent implements OnInit {

  logsHtml: SafeHtml;
  private _selectedItem: RunningTaskQueueItem;
  PUscoresVisible: boolean = false;
  private _closingPayload: any = null;
  private _clearedItems: RunningTaskQueueItem[] = [];

  get selectedItem(): RunningTaskQueueItem {
    return this._selectedItem;
  }
  
  get logs(): string[] {
    return this._selectedItem?.response['logs'];
  }

  get items(): RunningTaskQueueItem[] {
    return this.data;
  }

  isSelected(item: RunningTaskQueueItem): boolean {
    return this._selectedItem?.task === item.task;
  }

  isCleared(item: RunningTaskQueueItem): boolean {
    return this._clearedItems.filter(i => {
      return i.task === item.task;
    }).length === 1;
  }

  hasOutput(item: RunningTaskQueueItem): boolean {
    return item.subType === RunningTaskSubType.EVALUATE_DOMAIN_MODEL;
  }

  hasDocuments(item: RunningTaskQueueItem): boolean {
    return item.subType === RunningTaskSubType.SAMPLE_DOMAIN_MODEL;
  }

  constructor(
    private dialogRef: MatDialogRef<ModelTaskDetailsComponent>,
    protected language: TranslateService,
    private sanitizer: DomSanitizer,
    protected enumUtils: AppEnumUtils,
    protected config: InstallationConfigurationService,
    @Inject(MAT_DIALOG_DATA) private data: RunningTaskQueueItem[]
  ) { }

  ngOnInit(): void { }

  close(): void {
    this.dialogRef.close(this._closingPayload);
  }

  selectItem(item: RunningTaskQueueItem): void {
    this.PUscoresVisible = false;
    this._selectedItem = item;
  }

  showLogs(item: RunningTaskQueueItem): void {
    this.selectItem(item);
    this._updateLogs();
  }
  
  showPUscores(item: RunningTaskQueueItem): void {
    this.selectItem(item);
    this._clearLogs();
    this.PUscoresVisible = true;
  }

  loadDocuments(item: RunningTaskQueueItem): void {
    this.dialogRef.close({item, action: 'LOAD_DOCUMENTS'});
  }

  clearItem(item:RunningTaskQueueItem): void {
    this._clearedItems.push(item);
    this._closingPayload = {
      items: this._clearedItems,
      action: 'CLEAR_ITEMS'
    }
  }

  getDuration(item: RunningTaskQueueItem): number {
    return (new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()) / 1000;
  }

  extractLabel(label: string) {
    return label.split("::")[0];
  }

  private _updateLogs(): void {
    this.logsHtml = "";
    let _logs = "";
    for (let line of this.logs) {
      _logs += line + "<br>";
    }
    if (_logs !== "") this.logsHtml = this.sanitizer.bypassSecurityTrustHtml(_logs);
  }

  private _clearLogs(): void {
    this.logsHtml = "";
  }

}