import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { Topic, TopicModel } from '@app/core/model/model/topic-model.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { TopicModelLookup } from '@app/core/query/topic-model.lookup';
import { TopicLookup } from '@app/core/query/topic.lookup';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { nameof } from 'ts-simple-nameof';
import { ModelParam } from '../../model-parameters-table/model-parameters-table.component';
import { DomainModelActiveLearningEditorModel } from '../domain-model-active-learning-editor.model';
import { DomainModelClassifierEditorModel } from '../domain-model-classifier-editor.model';
import { DomainModelEditorModel } from '../domain-model-editor.model';
import { bySelectionFunctionParams } from '../domain-model-params.model';
import { DomainModelService } from '@app/core/services/http/domain-model.service';

@Component({
  templateUrl: './domain-model-from-selection-function.component.html',
  styleUrls: ['./domain-model-from-selection-function.component.scss']
})
export class DomainModelFromSelectionFunctionComponent implements OnInit {

  availableCorpora: string[];
  availableModels: string[];

  topics: {
    id: number,
    description: string,
    weight: number
  }[] = [];
  topicWeights: number[] = [];

  selectedCorpus: string = undefined;

  editorModel: DomainModelEditorModel;
  formGroup: FormGroup;
  classifierEditorModel: DomainModelClassifierEditorModel;
  classifierFormGroup: FormGroup;
  topicWeightsFormGroup: FormGroup;
  activeLearningEditorModel: DomainModelActiveLearningEditorModel;
  activeLearningFormGroup: FormGroup;

  advanced: boolean = false;
  advandedForAL: boolean = false;

  // get valid() {
  //   return this.formGroup?.valid && this.classifierFormGroup?.valid && this.activeLearningFormGroup?.valid;
  // }

  get valid() {
    return this.formGroup?.valid;
  }

  get weightsInputs(): FormArray {
    return this.topicWeightsFormGroup?.get('weights') as FormArray;
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
    private dialogRef: MatDialogRef<DomainModelFromSelectionFunctionComponent>,
    public enumUtils: AppEnumUtils,
    private formBuilder: FormBuilder,
    private corpusService: LogicalCorpusService,
    private topicModelService: TopicModelService,
    private domainModelService: DomainModelService
  ) {
    const corpusLookup = new LogicalCorpusLookup();
    corpusLookup.project = { fields: [nameof<LogicalCorpus>(x => x.name)] };
    corpusLookup.corpusValidFor = "DC";
    this.corpusService.query(corpusLookup).subscribe((response) => {
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
      this.topicWeightsFormGroup = this.formBuilder.group({
        weights: this.formBuilder.array([])
      });
      this.topicWeightsFormGroup.valueChanges.subscribe((value) => {
        this.topicWeights = value.weights;
      });
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

    const modelsLookup = new TopicModelLookup();
    modelsLookup.project = { fields: [nameof<TopicModel>(x => x.name)] };
    this.topicModelService.query(modelsLookup).subscribe((response) => {
      const models = response.items;
      this.availableModels = models.map(model => model.name);
    });
  }

  onModelSelected(event: any) {
    const model = event.value;

    const topicsLookup = new TopicLookup();
    topicsLookup.project = { 
      fields: [
        nameof<Topic>(x => x.id),
        nameof<Topic>(x => x.label),
        nameof<Topic>(x => x.size)
      ] 
    };
    this.topicModelService.queryTopics(model, topicsLookup).subscribe((response) => {
      const topics = response.items;
      this.topics = topics.map((topic) => {
        return {
          id: topic.id,
          description: topic.label,
          weight: +topic.size
        }
      });
      for (let topic of topics) {
        this.weightsInputs.push(new FormControl(+topic.size))
      }
    });
  }

  create(): void {
    let parameters: any = {}

    parameters['DC.n_max'] = this.formGroup.get('numberOfElements').value;
    parameters['DC.s_min'] = this.formGroup.get('minimumScore').value;

    // parameters['classifier.modelType'] = this.classifierFormGroup.get('modelType').value;
    // parameters['classifier.modelName'] = this.classifierFormGroup.get('modelName').value;
    // parameters['classifier.maximumImbalance'] = this.classifierFormGroup.get('maximumImbalance').value;
    // parameters['classifier.nmax'] = this.classifierFormGroup.get('nmax').value;
    // parameters['classifier.freezeEncoder'] = this.classifierFormGroup.get('freezeEncoder').value;
    // parameters['classifier.epochs'] = this.classifierFormGroup.get('epochs').value;
    // parameters['classifier.batchSize'] = this.classifierFormGroup.get('batchSize').value;

    // parameters['AL.nDocs'] = this.activeLearningFormGroup.get('nDocs').value;
    // parameters['AL.sampler'] = this.activeLearningFormGroup.get('sampler').value;
    // parameters['AL.pRatio'] = this.activeLearningFormGroup.get('pRatio').value;
    // parameters['AL.topProb'] = this.activeLearningFormGroup.get('topProb').value;

    const model: any = {
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      tag: this.formGroup.get('tag').value,
      corpus: this.formGroup.get('corpus').value,
      visibility: this.isPrivate ? "Private" : "Public",
      task: "on_create_topic_selection",
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