import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ModelParam } from "../../model-parameters-table/model-parameters-table.component";

@Component({
  selector: 'app-domain-model-curation-dialog',
  templateUrl: './domain-model-curation-dialog.component.html',
  styleUrls: ['./domain-model-curation-dialog.component.scss']
})
export class DomainModelCurationDialogComponent implements OnInit {

  get title(): string {
    return this.data?.title;
  }
  
  get formGroup(): FormGroup {
    return this.data?.formGroup;
  }

  get params(): ModelParam[] {
    return this.data?.parameters;
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<DomainModelCurationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public language: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.setDefaultParamValues();
    }, 0);
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close(this.formGroup.value);
  }

  setDefaultParamValues() {
    for (let param of this.params) {
      this.formGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
  }

}