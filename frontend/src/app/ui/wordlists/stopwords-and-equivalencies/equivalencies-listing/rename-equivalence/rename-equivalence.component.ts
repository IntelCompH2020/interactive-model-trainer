import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EquivalenceService } from "@app/core/services/http/equivalence.service";

@Component({
  selector: 'app-rename-equivalence',
  templateUrl: './rename-equivalence.component.html',
  styleUrls: ['./rename-equivalence.component.scss']
})
export class RenameEquivalenceComponent implements OnInit {

  formGroup: FormGroup;

  get name() {
    return this.data?.equivalence.name;
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameEquivalenceComponent>,
    private equivalenceService: EquivalenceService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void { }

  submit(): void {
    if(this.data?.equivalence && this.formGroup.valid){
      this.equivalenceService.rename({
        newName: this.formGroup.value.name, 
        oldName: this.data.equivalence.name
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