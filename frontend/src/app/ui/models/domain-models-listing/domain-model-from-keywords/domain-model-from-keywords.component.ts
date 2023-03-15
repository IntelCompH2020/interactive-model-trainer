import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DomainModelSubType, DomainModelType } from '@app/core/enum/domain-model-type.enum';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { KeywordLookup } from '@app/core/query/keyword.lookup';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { nameof } from 'ts-simple-nameof';
import { DomainModelEditorModel } from '../domain-model-editor.model';

@Component({
  templateUrl: './domain-model-from-keywords.component.html',
  styleUrls: ['./domain-model-from-keywords.component.scss']
})
export class DomainModelFromKeywordsComponent implements OnInit {

  availableTypes: DomainModelType[];
  availableSubTypes: DomainModelSubType[];

  availableCorpora: string[];

  keywords: string[];
  selectedKeywords: Set<string> = new Set();
  availableKeywordLists: Keyword[];

  selectedCorpus: string = undefined;

  editorModel: DomainModelEditorModel;
  formGroup: FormGroup;

  advanced: boolean = false;

  get valid() {
    return this.formGroup?.valid;
  }

  get corpusInput(): FormControl {
    return this.formGroup?.get('corpus') as FormControl;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<DomainModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  constructor(
    private dialogRef: MatDialogRef<DomainModelFromKeywordsComponent>,
    public enumUtils: AppEnumUtils,
    private keywordService: KeywordService,
    private corpusService: LogicalCorpusService,
    protected modelSelectionService: ModelSelectionService
  ) {
    this.availableSubTypes = this.enumUtils.getEnumValues<DomainModelSubType>(DomainModelSubType);
    this.availableTypes = this.enumUtils.getEnumValues<DomainModelType>(DomainModelType);

    const logicalLookup = new LogicalCorpusLookup();
    logicalLookup.project = { fields: [nameof<LogicalCorpus>(x => x.name)] };
    logicalLookup.corpusValidFor = "DC";
    this.corpusService.query(logicalLookup).subscribe((response) => {
      const corpora = response.items;
      this.availableCorpora = corpora.map(corpus => corpus.name);
      this.corpusInput.enable();
    });

    const keywordLookup = new KeywordLookup();
    keywordLookup.project = { 
      fields: [
        nameof<Keyword>(x => x.name),
        nameof<Keyword>(x => x.wordlist)
      ] 
    };
    this.keywordService.query(keywordLookup).subscribe((response) => {
      const keywords = response.items;
      this.availableKeywordLists = keywords;
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new DomainModelEditorModel();
      this.formGroup = this.editorModel.buildForm();
      this.corpusInput.disable();

      this.updateAdvanced(this.advanced);

      let corpusToSet: string = (this.modelSelectionService.corpus?.name && this.modelSelectionService.corpus?.valid_for === "DC") ? this.modelSelectionService.corpus?.name : "";
      if (this.selectedCorpus) corpusToSet = this.selectedCorpus;
      this.formGroup.get('corpus').setValue(corpusToSet);
    }, 0);
  }

  close(): void {
    this.dialogRef.close();
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<DomainModel>(x => x.visibility))
      .setValue(
        change.checked ?
          ModelVisibility.Private
          :
          ModelVisibility.Public
      );
  }

  onCorpusSelected(event: any) {
    this.selectedCorpus = event.value;
  }

  onKeywordListSelected(event: any) {
    const keywordList: Keyword = event.value as Keyword;
    this.keywords = this.availableKeywordLists.filter(k => k.name === keywordList.name)[0].wordlist;
  }

  addKeyword(keyword: string) {
    this.selectedKeywords.add(keyword);
  }

  removeKeyword(keyword: string) {
    this.selectedKeywords.delete(keyword);
  }

  updateAdvanced(value: boolean) {
    if (!value) {
      this.formGroup.get('type').reset();
      this.formGroup.get('subtype').reset();
      this.formGroup.get('numberOfHeads').reset();
      this.formGroup.get('depth').reset();
    }
  }

  create(): void {
    this.dialogRef.close(true);
  }
}