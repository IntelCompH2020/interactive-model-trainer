import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { TranslateService } from '@ngx-translate/core';
import { nameof } from 'ts-simple-nameof';
import { MergeWordlistsEditorModel } from './merge-wordlists-editor.model';
import { WordListType } from '@app/core/model/wordlist/wordlist.model';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { Equivalence, EquivalenceItem } from '@app/core/model/equivalence/equivalence.model';
import { StopwordLookup } from '@app/core/query/stopword.lookup';
import { lookup } from 'dns';
import { EquivalenceLookup } from '@app/core/query/equivalence.lookup';
import { KeywordLookup } from '@app/core/query/keyword.lookup';
import { WordlistDetailsComponent } from '../wordlist-details/wordlist-details.component';

@Component({
  selector: 'app-merge-wordlists-dialog',
  templateUrl: './merge-wordlists-dialog.component.html',
  styleUrls: ['./merge-wordlists-dialog.component.scss']
})
export class MergeWordlistsDialogComponent implements OnInit {

  formGroup: FormGroup;
  editorModel: MergeWordlistsEditorModel;

  listsLoading: boolean = true;

  private availableLists: Stopword[] | Equivalence[] | Keyword[] = [];

  get lists(): Stopword[] | Equivalence[] | Keyword[] {
    return this.availableLists;
  }

  protected get listsFormArray(): FormArray {
    return this.formGroup.get('lists') as FormArray;
  }

  get resultingList(): any[] {
    let result: any[] = [];
    if (WordListType.Equivalence === this.wordlistType) {
      for (let list of this.lists) {
        let wordlist = list.wordlist as EquivalenceItem[];
        if (this.isListSelected(list)) result.push(...wordlist)
      }
    } else {
      for (let list of this.lists) {
        let wordlist = list.wordlist as string[];
        if (this.isListSelected(list)) result.push(...wordlist)
      }
    }
    return [...new Set(result)];
  }

  get wordlistType(): WordListType {
    return this.data?.wordlistType;
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get('visibility')?.value === WordListVisibility.Private);
  }

  constructor(
    private dialogRef: MatDialogRef<MergeWordlistsDialogComponent>,
    private dialog: MatDialog,
    private keywordService: KeywordService,
    private stopwordService: StopwordService,
    private equivalenceService: EquivalenceService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.editorModel = new MergeWordlistsEditorModel();
    this.formGroup = this.editorModel.buildForm();
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (WordListType.Stopword === this.wordlistType) {
        let lookup = new StopwordLookup();
        lookup.project = {
          fields: [
            nameof<Stopword>(x => x.name),
            nameof<Stopword>(x => x.description),
            nameof<Stopword>(x => x.wordlist)
          ]
        };
        this.stopwordService.query(lookup).subscribe((results) => {
          this.availableLists = results.items;
          this.listsLoading = false;
        });
      } else if (WordListType.Equivalence === this.wordlistType) {
        let lookup = new EquivalenceLookup();
        lookup.project = {
          fields: [
            nameof<Equivalence>(x => x.name),
            nameof<Equivalence>(x => x.description),
            nameof<Equivalence>(x => x.wordlist)
          ]
        };
        this.equivalenceService.query(lookup).subscribe((results) => {
          this.availableLists = results.items;
          this.listsLoading = false;
        });
      } else if (WordListType.Keyword === this.wordlistType) {
        let lookup = new KeywordLookup();
        lookup.project = {
          fields: [
            nameof<Keyword>(x => x.name),
            nameof<Keyword>(x => x.description),
            nameof<Keyword>(x => x.wordlist)
          ]
        };
        this.keywordService.query(lookup).subscribe((results) => {
          this.availableLists = results.items;
          this.listsLoading = false;
        });
      }
    }, 0);
  }

  submit(): void {
    if (this.formGroup.valid) {
      if (WordListType.Stopword === this.wordlistType) {
        let wordlist: Stopword = this.formGroup.value;
        wordlist.wordlist = this.resultingList as string[];
        this.stopwordService.create(wordlist).subscribe(
          _response => {
            this.dialogRef.close(true);
          }
        );
      } else if (WordListType.Equivalence === this.wordlistType) {
        let wordlist: Equivalence = this.formGroup.value;
        wordlist.wordlist = this.resultingList as EquivalenceItem[];
        this.equivalenceService.create(wordlist).subscribe(
          _response => {
            this.dialogRef.close(true);
          }
        );
      } else if (WordListType.Keyword === this.wordlistType) {
        let wordlist: Keyword = this.formGroup.value;
        wordlist.wordlist = this.resultingList as string[];
        this.keywordService.create(wordlist).subscribe(
          _response => {
            this.dialogRef.close(true);
          }
        );
      }
    } else return;

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
    this.formGroup.get('visibility')
      .setValue(
        change.checked ?
          WordListVisibility.Private
          :
          WordListVisibility.Public
      );
  }

  viewDetails(list: any): void {
    this.dialog.open(WordlistDetailsComponent,
      {
        width: '60rem',
        maxWidth: "90vw",
        maxHeight: '90vh',
        disableClose: true,
        data: {
          wordlist: list
        }
      }
    );
  }

  isListSelected(list: any): boolean {
    if (list === undefined) return false;
    const selectedLists: string[] = this.listsFormArray?.value;
    return selectedLists.includes(list['name']);
  }

  addList(list: any): void {
    this.listsFormArray.push(
      new FormControl(list['name'])
    );
  }

  removeList(list: any): void {
    this.listsFormArray.removeAt((this.listsFormArray.value as string[]).indexOf(list['name']));
  }

}