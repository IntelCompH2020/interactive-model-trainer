import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { StopwordService } from "@app/core/services/http/stopword.service";

@Component({
  selector: 'app-rename-stopword',
  templateUrl: './rename-stopword.component.html',
  styleUrls: ['./rename-stopword.component.scss']
})
export class RenameStopwordComponent implements OnInit {

  formGroup: FormGroup;

  get name() {
    return this.data?.stopword.name;
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameStopwordComponent>,
    private stopwordService: StopwordService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void { }

  submit(): void {
    if(this.data?.stopword && this.formGroup.valid){
      this.stopwordService.rename({
        newName: this.formGroup.value.name, 
        oldName: this.data.stopword.name
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