import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { RenameEditorModel } from "./rename-editor.model";

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss']
})
export class RenameDialogComponent implements OnInit {

  editorModel: RenameEditorModel;
  formGroup: FormGroup;

  get title(): string {
    return this.data['title'];
  }

  get name(): string {
    return this.data['name'];
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameDialogComponent>,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new RenameEditorModel().fromModel(this.name);
      this.formGroup = this.editorModel.buildForm();
    }, 0);
  }

  rename(): void {
    this.dialogRef.close(this.formGroup.value);
  }

  close(): void {
    this.dialogRef.close(false);
  }

}