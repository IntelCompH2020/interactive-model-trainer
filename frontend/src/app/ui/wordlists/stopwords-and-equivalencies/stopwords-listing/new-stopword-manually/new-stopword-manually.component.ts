import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { nameof } from 'ts-simple-nameof';
import { StopwordEditorModel } from '../stopword-editor.model';

@Component({
  selector: 'app-new-stopword-manually',
  templateUrl: './new-stopword-manually.component.html',
  styleUrls: ['./new-stopword-manually.component.scss']
})
export class NewStopwordManuallyComponent implements OnInit {

  editorModel: StopwordEditorModel;
  formGroup: FormGroup;

  protected get stopWordsFormArray(): FormArray{
    return this.formGroup.get(nameof<Stopword>(x => x.wordlist)) as FormArray;
  }

  public get stopwords(): readonly string[]{
    return this.stopWordsFormArray?.value;
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get isPrivate(): boolean{
    return !!(this.formGroup?.get(nameof<Stopword>(x => x.visibility))?.value === WordListVisibility.Private );
  }

  currentStopword = '';

  constructor(
   private dialogRef: MatDialogRef<NewStopwordManuallyComponent>,
   private stopwordService: StopwordService,
   @Inject(MAT_DIALOG_DATA) private data
  ) {
    
    this.editorModel = new StopwordEditorModel();
    if(data?.stopword){
      this.editorModel.fromModel(data.stopword as Stopword);
      this.currentStopword = ''
    }
    this.formGroup = this.editorModel.buildForm();

   }

  ngOnInit(): void {}

  submit(): void{
    
    if(!this.formGroup.valid){
      this.formGroup.markAllAsTouched();
      return;
    }

    this.stopwordService.create(this.formGroup.value).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    )

  }
  
  close(): void{
    this.dialogRef.close();
  }

  addStopword(stopword: string): void{
    if(!stopword){
      return;
    }
    this.stopWordsFormArray.push(
      new FormControl(stopword)
    )
  }

  onPrivateChange(change: MatCheckboxChange): void{
    this.formGroup.get(nameof<Stopword>(x => x.visibility))
    .setValue(
      change.checked ? 
        WordListVisibility.Private
        :
        WordListVisibility.Public
    );
  }
  removeStopword(index: number){
    if(index<0 || index> this.stopwords.length -1){
      console.warn('index out of bounds');
      return;
    }

    this.stopWordsFormArray.removeAt(index);
  }
}