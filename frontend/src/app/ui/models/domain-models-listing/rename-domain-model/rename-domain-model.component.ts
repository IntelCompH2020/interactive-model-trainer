import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomainModelService } from "@app/core/services/http/domain-model.service";

@Component({
  selector: 'app-rename-domain-model',
  templateUrl: './rename-domain-model.component.html',
  styleUrls: ['./rename-domain-model.component.scss']
})
export class RenameDomainModelComponent implements OnInit {

  formGroup: FormGroup;

  get name() {
    return this.data?.model.name;
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<RenameDomainModelComponent>,
    private domainModelService: DomainModelService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void { }

  submit(): void {
    if(this.data?.model && this.formGroup.valid){
      this.domainModelService.rename({
        newName: this.formGroup.value.name, 
        oldName: this.data.model.name
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