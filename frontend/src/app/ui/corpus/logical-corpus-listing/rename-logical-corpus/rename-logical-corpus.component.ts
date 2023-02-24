import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LogicalCorpusService } from "@app/core/services/http/logical-corpus.service";

@Component({
  selector: 'app-rename-logical-corpus',
  templateUrl: './rename-logical-corpus.component.html',
  styleUrls: ['./rename-logical-corpus.component.scss']
})
export class RenameLogicalCorpusComponent implements OnInit {

  formGroup: FormGroup;

  get name() {
    return this.data?.corpus.name;
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameLogicalCorpusComponent>,
    private logicalCorpusService: LogicalCorpusService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void { }

  submit(): void {
    if(this.data?.corpus && this.formGroup.valid){
      this.logicalCorpusService.rename({
        newName: this.formGroup.value.name, 
        oldName: this.data.corpus.name
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