import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef} from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-new-equivalence-from-file',
  templateUrl: './new-equivalence-from-file.component.html',
  styleUrls: ['./new-equivalence-from-file.component.scss']
})
export class NewEquivalenceFromFileComponent implements OnInit {

  formGroup: FormGroup;

  file: {
    name?: string,
    contents?: string
  } = {}

  wordlist: string[] = [];

  get isPrivate(): boolean{
    return !!(this.formGroup?.get(nameof<Equivalence>(x => x.visibility))?.value === WordListVisibility.Private );
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
   private dialogRef: MatDialogRef<NewEquivalenceFromFileComponent>,
   private formBuilder: FormBuilder,
   private equivalenceService: EquivalenceService
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      visibility: [false]
    });
   }

  ngOnInit(): void {
  }

  onPrivateChange(change: MatCheckboxChange): void{
    this.formGroup.get(nameof<Equivalence>(x => x.visibility))
    .patchValue(
      change.checked ? 
        WordListVisibility.Private
        :
        WordListVisibility.Public
    );
  }

  onFileSelected(files: FileList) {
    this.file.name = files.item(0).name;
    this.formGroup.patchValue({name: this.getNameFromFileName(files.item(0).name)})
    let reader: FileReader = new FileReader();
    reader.onloadend = (_ev => {
      this.file.contents = reader.result.toString();
      this.updateWordlist();
    })
    reader.readAsText(files[0]);
  }

  getNameFromFileName(fileName: string) {
    return fileName ? fileName.substring(0, fileName.lastIndexOf('.')) : "";
  }

  private getWordlistData(): any {
    let content = JSON.parse(this.file.contents);
    return Object.assign(
      {}, content, {visibility: this.formGroup.value.visibility}
    );
  }

  private updateWordlist(): void {
    let content = JSON.parse(this.file.contents);
    this.wordlist = content["wordlist"] || [];
  }

  submit(): void{
    this.equivalenceService.create(this.getWordlistData()).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    )
  }

  close(): void{
    this.dialogRef.close();
  }
}