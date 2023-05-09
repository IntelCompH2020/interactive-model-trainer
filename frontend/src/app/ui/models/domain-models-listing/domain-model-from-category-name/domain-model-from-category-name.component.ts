import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { nameof } from 'ts-simple-nameof';
import { ModelParam } from '../../model-parameters-table/model-parameters-table.component';
import { DomainModelActiveLearningEditorModel } from '../domain-model-active-learning-editor.model';
import { DomainModelClassifierEditorModel } from '../domain-model-classifier-editor.model';
import { DomainModelEditorModel } from '../domain-model-editor.model';
import { bySelectionFunctionParams } from '../domain-model-params.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';

@Component({
  templateUrl: './domain-model-from-category-name.component.html',
  styleUrls: ['./domain-model-from-category-name.component.scss']
})
export class DomainModelFromCategoryNameComponent implements OnInit {

  availableCorpora: string[];

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
    return this.formGroup?.valid && this.classifierFormGroup?.valid && this.activeLearningFormGroup?.valid;
  }

  get corpusInput(): FormControl {
    return this.formGroup?.get('corpus') as FormControl;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<DomainModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  get params(): ModelParam[] {
    return bySelectionFunctionParams(false, null);
  }

  get advancedParams(): ModelParam[] {
    return bySelectionFunctionParams(true, 'classifier');
  }

  get advancedParamsForAL(): ModelParam[] {
    return bySelectionFunctionParams(true, 'active_learning');
  }

  constructor(
    private dialogRef: MatDialogRef<DomainModelFromCategoryNameComponent>,
    public enumUtils: AppEnumUtils,
    private corpusService: LogicalCorpusService,
    private domainModelService: DomainModelService
  ) {
    const lookup = new LogicalCorpusLookup();
    lookup.project = { fields: [nameof<LogicalCorpus>(x => x.name)] };
    lookup.corpusValidFor = "DC";
    this.corpusService.query(lookup).subscribe((response) => {
      const corpora = response.items;
      this.availableCorpora = corpora.map(corpus => corpus.name);
      this.corpusInput.enable();
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

  create(): void {
    let parameters: any = {}

    parameters['DC.n_max'] = this.formGroup.get('numberOfElements').value;
    parameters['DC.s_min'] = this.formGroup.get('minimumScore').value;

    parameters['classifier.modelType'] = this.classifierFormGroup.get('modelType').value;
    parameters['classifier.modelName'] = this.classifierFormGroup.get('modelName').value;
    parameters['classifier.maximumImbalance'] = this.classifierFormGroup.get('maximumImbalance').value;
    parameters['classifier.nmax'] = this.classifierFormGroup.get('nmax').value;
    parameters['classifier.freezeEncoder'] = this.classifierFormGroup.get('freezeEncoder').value;
    parameters['classifier.epochs'] = this.classifierFormGroup.get('epochs').value;
    parameters['classifier.batchSize'] = this.classifierFormGroup.get('batchSize').value;

    parameters['AL.nDocs'] = this.activeLearningFormGroup.get('nDocs').value;
    parameters['AL.sampler'] = this.activeLearningFormGroup.get('sampler').value;
    parameters['AL.pRatio'] = this.activeLearningFormGroup.get('pRatio').value;
    parameters['AL.topProb'] = this.activeLearningFormGroup.get('topProb').value;

    const model: any = {
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      tag: this.formGroup.get('tag').value,
      corpus: this.formGroup.get('corpus').value,
      visibility: this.isPrivate ? "Private" : "Public",
      task: "on_create_category_name",
      keywords: '',
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