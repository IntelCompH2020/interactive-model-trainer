import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { MarkdownDialogComponent } from '@app/ui/markdown-dialog/markdown-dialog.component';
import { nameof } from 'ts-simple-nameof';

@Component({
  selector: 'app-new-keyword-from-file',
  templateUrl: './new-keyword-from-file.component.html',
  styleUrls: ['./new-keyword-from-file.component.scss']
})
export class NewKeywordFromFileComponent implements OnInit {

  formGroup: FormGroup;

  file: {
    name?: string,
    contents?: string
  } = {}

  wordlist: string[] = [];

  get isPrivate(): boolean{
    return !!(this.formGroup?.get(nameof<Keyword>(x => x.visibility))?.value === WordListVisibility.Private );
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
   private dialogRef: MatDialogRef<NewKeywordFromFileComponent>,
   private formBuilder: FormBuilder,
   private keywordService: KeywordService,
   protected dialog: MatDialog,
  ) { 
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      visibility: [WordListVisibility.Public]
    });
  }

  ngOnInit(): void {
  }

  onPrivateChange(change: MatCheckboxChange): void{
    this.formGroup.get(nameof<Keyword>(x => x.visibility))
    .patchValue(
      change.checked ? 
        WordListVisibility.Private
        :
        WordListVisibility.Public
    );
  }

  onFileSelected(files: FileList) {
    this.file.name = files.item(0).name;
    this.formGroup.patchValue({name: this.getNameFromFileName(files.item(0).name)});
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

  showInfo(): void {
    this.dialog.open(MarkdownDialogComponent, {
      width: "50rem",
      maxWidth: "90vw",
      disableClose: true,
      data: {
        title: "Help - Wordlists imported file format",
        markdownSource: "/assets/guides/wordlist-format.md"
      }
    })
  }
  
  submit(): void{
    this.keywordService.create(this.getWordlistData()).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    )
  }

  close(): void{
    this.dialogRef.close();
  }

}