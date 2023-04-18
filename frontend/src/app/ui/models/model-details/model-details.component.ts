import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { extractAllTopicModelParametersByTrainer } from "../topic-models-listing/topic-model-params.model";

@Component({
  selector: 'app-model-details',
  templateUrl: './model-details.component.html',
  styleUrls: ['./model-details.component.scss']
})
export class ModelDetailsComponent implements OnInit {

  params: {}[] = [];
  paramsReady: boolean = false;

  get name() {
    return this.data?.model.name;
  }

  get type() {
    return this.data?.model.type;
  }

  constructor(
    private dialogRef: MatDialogRef<ModelDetailsComponent>,
    private language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {

  }

  ngOnInit(): void {
    let _params = extractAllTopicModelParametersByTrainer(this.type);
    for (let [key, value] of Object.entries(this.data?.model.TMparam)) {
      for (let _param of _params) {
        if (_param.realName === key) {
          this.params.push({
            name: this.language.instant(_param.displayName),
            value,
            tooltip: _param.tooltip ? this.language.instant(_param.tooltip) : null
          });
          break;
        }
      }
    }
    this.paramsReady = true;
  }

  close(): void {
    this.dialogRef.close();
  }

}