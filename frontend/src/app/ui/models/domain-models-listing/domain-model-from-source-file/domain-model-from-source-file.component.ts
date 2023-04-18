import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { DomainModelEditorModel } from '../domain-model-editor.model';

@Component({
  templateUrl: './domain-model-from-source-file.component.html',
  styleUrls: ['./domain-model-from-source-file.component.scss']
})
export class DomainModelFromSourceFileComponent implements OnInit {
  editorModel : DomainModelEditorModel;
  formGroup: FormGroup;

  advanced: boolean = false;

  constructor(
   private dialogRef: MatDialogRef<DomainModelFromSourceFileComponent>,
   public enumUtils: AppEnumUtils
  ) {   
    this.editorModel = new DomainModelEditorModel();
    this.formGroup = this.editorModel.buildForm();

    this.updateAdvanced(this.advanced);

  }

  ngOnInit(): void {
  }



  close(): void{
    this.dialogRef.close();
  }

  updateAdvanced(value: boolean){
    if(!value){
      this.formGroup.get('type').reset(); 
      this.formGroup.get('subtype').reset(); 
      this.formGroup.get('numberOfHeads').reset(); 
      this.formGroup.get('depth').reset(); 
    }
  }
  create(): void{
    this.dialogRef.close(true);
  }
}