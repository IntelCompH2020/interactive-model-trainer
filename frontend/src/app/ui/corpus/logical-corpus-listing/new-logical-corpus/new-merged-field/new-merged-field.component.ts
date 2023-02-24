import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { BaseComponent } from "@common/base/base.component";

@Component({
  selector: 'app-new-merged-field]',
  templateUrl: './new-merged-field.component.html',
  styleUrls: ['./new-merged-field.component.scss']
})
export class NewMergedFieldComponent extends BaseComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<NewMergedFieldComponent>
  ) {
    super();
  }

  formGroup: FormGroup;

  ngOnInit(): void {
    this._setupForm();
  }

  private _setupForm(): void {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)]),
      type: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  submit(): void {
    this.dialogRef.close(this.formGroup.value);
  }

  close(): void {
    this.dialogRef.close(null);
  }

}