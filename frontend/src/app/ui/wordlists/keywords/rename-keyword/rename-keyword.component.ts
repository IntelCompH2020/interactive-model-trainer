import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { KeywordService } from "@app/core/services/http/keyword.service";

@Component({
  selector: 'app-rename-keyword',
  templateUrl: './rename-keyword.component.html',
  styleUrls: ['./rename-keyword.component.scss']
})
export class RenameKeywordComponent implements OnInit {

  formGroup: FormGroup;

  get name() {
    return this.data?.keywordList.name;
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameKeywordComponent>,
    private keywordService: KeywordService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void { }

  submit(): void {
    if(this.data?.keywordList && this.formGroup.valid){
      this.keywordService.rename({
        newName: this.formGroup.value.name, 
        oldName: this.data.keywordList.name
      })
      .subscribe(
        _response => {
          this.dialogRef.close(true);
        }
      );
    }
  }

  close(): void{
    this.dialogRef.close();
  }

}