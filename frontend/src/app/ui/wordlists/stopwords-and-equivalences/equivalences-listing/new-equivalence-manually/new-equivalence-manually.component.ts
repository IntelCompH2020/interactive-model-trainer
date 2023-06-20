import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Equivalence, EquivalenceItem } from '@app/core/model/equivalence/equivalence.model';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { TranslateService } from '@ngx-translate/core';
import { nameof } from 'ts-simple-nameof';
import { EquivalenceEditorModel } from '../equivalence-editor.model';

@Component({
  selector: 'app-new-equivalence-manually',
  templateUrl: './new-equivalence-manually.component.html',
  styleUrls: ['./new-equivalence-manually.component.scss']
})
export class NewEquivalenceManuallyComponent implements OnInit {

  editorModel: EquivalenceEditorModel;
  formGroup: FormGroup;

  get equivalence(): Equivalence {
    return this.data?.equivalence;
  }

  private get _equivalenciesFormArray(): FormArray {
    return this.formGroup.get('wordlist') as FormArray;
  }

  public get equivalences(): readonly EquivalenceItem[] {
    return this._equivalenciesFormArray?.value;
  }

  get isNew(): boolean {
    return this.equivalence === undefined;
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<Equivalence>(x => x.visibility))?.value === WordListVisibility.Private);
  }

  get canPrivate(): boolean {
    if (this.isNew) return true;
    else return this.equivalence.creator != null && this.equivalence.creator != "-"
  }

  term: string = '';
  equivalenceTerm: string = '';
  currentEquivalence = '';

  constructor(
    private dialogRef: MatDialogRef<NewEquivalenceManuallyComponent>,
    private equivaleceService: EquivalenceService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {

    this.editorModel = new EquivalenceEditorModel();
    if (this.equivalence) {
      this.editorModel.fromModel(this.equivalence);
      this.currentEquivalence = '';
    }
    this.formGroup = this.editorModel.buildForm();

  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.isNew) {
      this.equivaleceService.create(this.formGroup.value).subscribe(
        _response => {
          this.dialogRef.close(true);
        }
      )
    } else {
      this.equivaleceService.patch(this.formGroup.value).subscribe(
        _response => {
          this.dialogRef.close(true);
        }
      )
    }
  }

  addEquivalence(term: string, equivalence: string): void {
    if (!term || !equivalence) {
      return;
    }

    this._equivalenciesFormArray.push(
      new FormControl({
        term,
        equivalence
      })
    )
    this.term = null;
    this.equivalenceTerm = null;
  }

  removeEquivalence(index: number): void {
    if (index < 0 || index >= this.equivalences?.length) {
      console.warn('equivalence index out of bounds');
      return;
    }
    
    this._equivalenciesFormArray.removeAt(index);
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<Equivalence>(x => x.visibility))
      .setValue(
        change.checked ?
          WordListVisibility.Private
          :
          WordListVisibility.Public
      );
  }
}