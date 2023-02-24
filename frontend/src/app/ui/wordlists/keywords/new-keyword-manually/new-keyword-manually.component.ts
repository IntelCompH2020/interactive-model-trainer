import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { nameof } from 'ts-simple-nameof';
import { KeywordEditorModel } from '../keyword-editor.model';

@Component({
  selector: 'app-new-keyword-manually',
  templateUrl: './new-keyword-manually.component.html',
  styleUrls: ['./new-keyword-manually.component.scss']
})
export class NewKeywordManuallyComponent implements OnInit {

  formGroup: FormGroup;
  editorModel: KeywordEditorModel;

  protected get keywordsFormArray(): FormArray {
    return this.formGroup.get(nameof<Keyword>(x => x.wordlist)) as FormArray;
  }

  get keywords(): readonly string[] {
    return this.keywordsFormArray?.value;
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<Keyword>(x => x.visibility))?.value === WordListVisibility.Private);
  }

  currentKeyword = '';

  constructor(
    private dialogRef: MatDialogRef<NewKeywordManuallyComponent>,
    private keywordService: KeywordService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.editorModel = new KeywordEditorModel();
    if (data?.keywordList) {
      this.editorModel.fromModel(data.keywordList as Keyword);
      this.currentKeyword = '';
    }
    this.formGroup = this.editorModel.buildForm();

  }

  ngOnInit(): void {}

  submit(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.keywordService.create(this.formGroup.value).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    )

  }

  close(): void {
    this.dialogRef.close();
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<Keyword>(x => x.visibility))
      .setValue(
        change.checked ?
          WordListVisibility.Private
          :
          WordListVisibility.Public
      );
  }

  addKeyword(stopword: string): void {
    if (!stopword) {
      return;
    }

    this.keywordsFormArray.push(
      new FormControl(stopword)
    )
  }

  removeKeyword(index: number) {
    if (index < 0 || index > this.keywords.length - 1) {
      console.warn('index out of bounds');
      return;
    }

    this.keywordsFormArray.removeAt(index);
  }
}