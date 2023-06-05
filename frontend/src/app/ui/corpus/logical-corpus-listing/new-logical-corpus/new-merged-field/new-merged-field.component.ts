import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BaseComponent } from "@common/base/base.component";
import { availableFieldTypes } from "../../logical-corpus-editor.model";
import { LogicalCorpusField } from "@app/core/model/corpus/logical-corpus.model";

@Component({
  selector: 'app-new-merged-field]',
  templateUrl: './new-merged-field.component.html',
  styleUrls: ['./new-merged-field.component.scss']
})
export class NewMergedFieldComponent extends BaseComponent implements OnInit {

  availableFieldTypes: any[] = availableFieldTypes();
  
  constructor(
    private dialogRef: MatDialogRef<NewMergedFieldComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {
      field: LogicalCorpusField,
      targetField: LogicalCorpusField
    }
  ) {
    super();
  }

  formGroup: FormGroup;

  ngOnInit(): void {
    this._setupForm();
  }

  private _setupForm(): void {
    const inferedType = this.data.field.type === this.data.targetField.type ? this.data.targetField.type : null;
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)]),
      type: new FormControl(inferedType, [Validators.required])
    });
  }

  submit(): void {
    this.dialogRef.close(this.formGroup.value);
  }

  close(): void {
    this.dialogRef.close(null);
  }

}