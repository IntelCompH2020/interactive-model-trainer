import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { Keyword } from '@app/core/model/keyword/keyword.model';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { KeywordLookup } from '@app/core/query/keyword.lookup';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { KeywordService } from '@app/core/services/http/keyword.service';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { nameof } from 'ts-simple-nameof';
import { ModelParam } from '../../model-parameters-table/model-parameters-table.component';
import { DomainModelActiveLearningEditorModel } from '../domain-model-active-learning-editor.model';
import { DomainModelClassifierEditorModel } from '../domain-model-classifier-editor.model';
import { DomainModelEditorModel } from '../domain-model-editor.model';
import { byKeywordsParams } from '../domain-model-params.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';

@Component({
  templateUrl: './domain-model-from-keywords.component.html',
  styleUrls: ['./domain-model-from-keywords.component.scss']
})
export class DomainModelFromKeywordsComponent implements OnInit {

  availableCorpora: string[];

  keywords: string[];
  selectedKeywords: Set<string> = new Set();
  availableKeywordLists: Keyword[];

  selectedCorpus: string = undefined;

  editorModel: DomainModelEditorModel;
  formGroup: FormGroup;
  classifierEditorModel: DomainModelClassifierEditorModel;
  classifierFormGroup: FormGroup;
  activeLearningEditorModel: DomainModelActiveLearningEditorModel;
  activeLearningFormGroup: FormGroup;

  advanced: boolean = false;
  advandedForAL: boolean = false;

  get valid() {
    return this.formGroup?.valid
      && this.selectedKeywords && this.selectedKeywords.size
      && this.classifierFormGroup?.valid
      && this.activeLearningFormGroup?.valid;
  }

  get corpusInput(): FormControl {
    return this.formGroup?.get('corpus') as FormControl;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<DomainModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  get params(): ModelParam[] {
    return byKeywordsParams(false, null);
  }

  get advancedParams(): ModelParam[] {
    return byKeywordsParams(true, 'classifier');
  }

  get advancedParamsForAL(): ModelParam[] {
    return byKeywordsParams(true, 'active_learning');
  }

  constructor(
    private dialogRef: MatDialogRef<DomainModelFromKeywordsComponent>,
    public enumUtils: AppEnumUtils,
    private keywordService: KeywordService,
    private corpusService: LogicalCorpusService,
    private domainModelService: DomainModelService
  ) {
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
      this.classifierEditorModel = new DomainModelClassifierEditorModel();
      this.classifierFormGroup = this.classifierEditorModel.buildForm();
      this.activeLearningEditorModel = new DomainModelActiveLearningEditorModel();
      this.activeLearningFormGroup = this.activeLearningEditorModel.buildForm();
      this.corpusInput.disable();
      this.setDefaultParamValues();
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

  create(): void {
    let parameters: any = {}

    parameters['DC.method'] = this.formGroup.get('method').value;
    parameters['DC.wt'] = this.formGroup.get('weightingFactor').value;
    parameters['DC.n_max'] = this.formGroup.get('numberOfElements').value;
    parameters['DC.s_min'] = this.formGroup.get('minimumScore').value;
    parameters['DC.model_name'] = this.formGroup.get('modelName').value;

    const model: any = {
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      tag: this.formGroup.get('tag').value,
      corpus: this.formGroup.get('corpus').value,
      visibility: this.isPrivate ? "Private" : "Public",
      task: "on_create_list_of_keywords",
      keywords: [...this.selectedKeywords].join(','),
      parameters
    }

    this.domainModelService.train(model).subscribe(
      response => {
        this.dialogRef.close({
          label: model.name,
          finished: false,
          model,
          task: response.id,
          startedAt: new Date()
        });
      },
      _error => {
        console.error(_error);
        this.dialogRef.close(null);
      }
    );
  }

  setDefaultParamValues() {
    for (let param of this.params) {
      this.formGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
    for (let param of this.advancedParams) {
      this.classifierFormGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
    for (let param of this.advancedParamsForAL) {
      this.activeLearningFormGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
  }
}