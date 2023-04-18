import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { TopicModelType } from '@app/core/enum/topic-model.-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { TranslateService } from '@ngx-translate/core';
import { nameof } from 'ts-simple-nameof';
import { TopicModelEditorModel } from './topic-model-editor.model';
import { CTMParams, malletParams, preprocessingParams, prodLDAParams, sparkLDAParams } from '../topic-model-params.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { ModelParam } from '../../model-parameters-table/model-parameters-table.component';
import { TopicModelPreprocessingEditorModel } from './topic-model-preprocessing-editor.model';
import { StopwordService } from '@app/core/services/http/stopword.service';
import { EquivalenceService } from '@app/core/services/http/equivalence.service';
import { StopwordLookup } from '@app/core/query/stopword.lookup';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { EquivalenceLookup } from '@app/core/query/equivalence.lookup';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';

@Component({
  selector: 'app-new-topic-model',
  templateUrl: './new-topic-model.component.html',
  styleUrls: ['./new-topic-model.component.scss']
})
export class NewTopicModelComponent implements OnInit {

  availableTypes: TopicModelType[];

  availableCorpora: string[];
  availableStopwords: string[];
  availableEquivalencies: string[];

  TopicModelType = TopicModelType;
  selectedType: TopicModelType = TopicModelType.mallet;
  selectedCorpus: string = undefined;

  editorModel: TopicModelEditorModel;
  formGroup: FormGroup;
  preprocessingEditorModel: TopicModelPreprocessingEditorModel;
  preprocessingFormGroup: FormGroup;

  advanced: boolean = false;
  advancedForPreprocessing: boolean = false;

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<TopicModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  get valid(): boolean {
    return this.formGroup?.valid && this.preprocessingFormGroup?.valid;
  }

  get params(): ModelParam[] {
    if (this.selectedType == TopicModelType.mallet) return malletParams(false);
    else if (this.selectedType == TopicModelType.prodLDA) return prodLDAParams(false);
    else if (this.selectedType == TopicModelType.CTM) return CTMParams(false);
    else if (this.selectedType == TopicModelType.sparkLDA) return sparkLDAParams(false);
    return [];
  }

  get advancedParams(): ModelParam[] {
    if (this.selectedType == TopicModelType.mallet) return malletParams(true);
    else if (this.selectedType == TopicModelType.prodLDA) return prodLDAParams(true);
    else if (this.selectedType == TopicModelType.CTM) return CTMParams(true);
    else if (this.selectedType == TopicModelType.sparkLDA) return sparkLDAParams(true);
    return [];
  }

  get advancedParamsForPreprocessing(): ModelParam[] {
    return preprocessingParams(this.availableStopwords, this.availableEquivalencies);
  }

  constructor(
    private dialogRef: MatDialogRef<NewTopicModelComponent>,
    public enumUtils: AppEnumUtils,
    private topicModelService: TopicModelService,
    private corpusService: LogicalCorpusService,
    private stopwordService: StopwordService,
    private equivalenceService: EquivalenceService,
    protected formBuilder: FormBuilder = new FormBuilder(),
    public translate: TranslateService
  ) {
    this.availableTypes = this.enumUtils.getEnumValues<TopicModelType>(TopicModelType);
    this.availableTypes = this.availableTypes.filter(t => t !== TopicModelType.all);
  
    const corpusLookup = new LogicalCorpusLookup();
    corpusLookup.project = {fields: [nameof<LogicalCorpus>(x => x.name)]};
    corpusLookup.corpusValidFor = "TM";
    this.corpusService.query(corpusLookup).subscribe((response) => {
      const corpora = response.items;
      this.availableCorpora = corpora.map(corpus => corpus.name)
    });

    const stopwordLookup = new StopwordLookup();
    stopwordLookup.project = {fields: [nameof<Stopword>(x => x.name)]};
    this.stopwordService.query(stopwordLookup).subscribe((response) => {
      const stopwords = response.items;
      this.availableStopwords = stopwords.map(stopword => stopword.name)
    });

    const equivalenceLookup = new EquivalenceLookup();
    equivalenceLookup.project = {fields: [nameof<Equivalence>(x => x.name)]};
    this.equivalenceService.query(equivalenceLookup).subscribe((response) => {
      const equivalences = response.items;
      this.availableEquivalencies = equivalences.map(equivalence => equivalence.name)
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new TopicModelEditorModel();
      this.formGroup = this.editorModel.buildForm(null, false, this.selectedType);
      this.formGroup.get('type').setValue(this.selectedType);
      this.preprocessingEditorModel = new TopicModelPreprocessingEditorModel();
      this.preprocessingFormGroup = this.preprocessingEditorModel.buildForm();
      this.setDefaultParamValues();
    }, 0);
  }

  close(): void {
    this.dialogRef.close();
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<TopicModel>(x => x.visibility))
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

  onTypeSelected(event: any) {
    this.selectedType = event.value;
    this.ngOnInit();
  };

  create(): void {
    let parameters: any = {}

    if (this.selectedType == TopicModelType.mallet) {
      parameters['TM.ntopics'] = this.formGroup.get('numberOfTopics').value;
      parameters['MalletTM.alpha'] = this.formGroup.get('alpha').value;
      parameters['MalletTM.num_iterations'] = this.formGroup.get('numberOfIterations').value;
      parameters['MalletTM.optimize_interval'] = this.formGroup.get('optimizeInterval').value;
      parameters['MalletTM.doc_topic_thr'] = this.formGroup.get('documentTopicsThreshold').value;
      parameters['MalletTM.num_threads'] = this.formGroup.get('numberOfThreads').value;
      //ADVANCED
      parameters['TM.thetas_thr'] = this.formGroup.get('thetasThreshold').value;
      parameters['MalletTM.token_regexp'] = this.formGroup.get('tokenRegEx').value;
      parameters['MalletTM.num_iterations_inf'] = this.formGroup.get('numberOfIterationsInf').value;
      parameters['MalletTM.labels'] = this.formGroup.get('labels').value;
    } else if (this.selectedType == TopicModelType.prodLDA) {
      parameters['TM.ntopics'] = this.formGroup.get('numberOfTopics').value;
      parameters['ProdLDA.model_type'] = this.formGroup.get('modelType').value;
      parameters['ProdLDA.num_epochs'] = this.formGroup.get('numberOfEpochs').value;
      parameters['ProdLDA.batch_size'] = this.formGroup.get('batchSize').value;
      //ADVANCED
      parameters['TM.thetas_thr'] = this.formGroup.get('thetasThreshold').value;
      parameters['ProdLDA.hidden_sizes'] = this.formGroup.get('hidenSizes').value;
      parameters['ProdLDA.activation'] = this.formGroup.get('activation').value;
      parameters['ProdLDA.dropout'] = this.formGroup.get('dropout').value;
      parameters['ProdLDA.learn_priors'] = this.formGroup.get('learnPriors').value;
      parameters['ProdLDA.lr'] = this.formGroup.get('lr').value;
      parameters['ProdLDA.momentum'] = this.formGroup.get('momentum').value;
      parameters['ProdLDA.solver'] = this.formGroup.get('solver').value;
      parameters['ProdLDA.reduce_on_plateau'] = this.formGroup.get('reduceOnPlateau').value;
      parameters['ProdLDA.topic_prior_mean'] = this.formGroup.get('topicPriorMean').value;
      parameters['ProdLDA.topic_prior_variance'] = this.formGroup.get('topicPriorVariance').value == undefined ? 'None' : this.formGroup.get('topicPriorVariance').value;
      parameters['ProdLDA.num_samples'] = this.formGroup.get('numberOfSamples').value;
      parameters['ProdLDA.num_data_loader_workers'] = this.formGroup.get('numberOfDataLoaderWorkers').value;
    } else if (this.selectedType == TopicModelType.CTM) {
      parameters['TM.ntopics'] = this.formGroup.get('numberOfTopics').value;
      parameters['CTM.model_type'] = this.formGroup.get('modelType').value;
      parameters['CTM.num_epochs'] = this.formGroup.get('numberOfEpochs').value;
      parameters['CTM.batch_size'] = this.formGroup.get('batchSize').value;
      //ADVANCED
      parameters['TM.thetas_thr'] = this.formGroup.get('thetasThreshold').value;
      parameters['CTM.ctm_model_type'] = this.formGroup.get('ctmModelType').value;
      parameters['CTM.hidden_sizes'] = this.formGroup.get('hidenSizes').value;
      parameters['CTM.activation'] = this.formGroup.get('activation').value;
      parameters['CTM.dropout'] = this.formGroup.get('dropout').value;
      parameters['CTM.learn_priors'] = this.formGroup.get('learnPriors').value;
      parameters['CTM.lr'] = this.formGroup.get('lr').value;
      parameters['CTM.momentum'] = this.formGroup.get('momentum').value;
      parameters['CTM.solver'] = this.formGroup.get('solver').value;
      parameters['CTM.num_samples'] = this.formGroup.get('numberOfSamples').value;
      parameters['CTM.reduce_on_plateau'] = this.formGroup.get('reduceOnPlateau').value;
      parameters['CTM.topic_prior_mean'] = this.formGroup.get('topicPriorMean').value;
      parameters['CTM.topic_prior_variance'] = this.formGroup.get('topicPriorVariance').value == undefined || this.formGroup.get('topicPriorVariance').value.trim().length == 0 ? 'None' : this.formGroup.get('topicPriorVariance').value;
      parameters['CTM.num_data_loader_workers'] = this.formGroup.get('numberOfDataLoaderWorkers').value;
      parameters['CTM.label_size'] = this.formGroup.get('labelSize').value;
      parameters['CTM.loss_weights'] = this.formGroup.get('lossWeights').value;
      parameters['CTM.sbert_model_to_load'] = this.formGroup.get('sbertModel').value == undefined || this.formGroup.get('sbertModel').value.trim().length == 0 ? 'None' : this.formGroup.get('sbertModel').value;
    } else if (this.selectedType == TopicModelType.sparkLDA) {
      parameters['TM.ntopics'] = this.formGroup.get('numberOfTopics').value;
      parameters['SparkLDA.alpha'] = this.formGroup.get('alpha').value;
      parameters['SparkLDA.maxIterations'] = this.formGroup.get('maxIterations').value;
      parameters['SparkLDA.optimizer'] = this.formGroup.get('optimizer').value;
      parameters['SparkLDA.optimizeDocConcentration'] = this.formGroup.get('optimizeDocConcentration').value;
      parameters['SparkLDA.subsamplingRate'] = this.formGroup.get('subsamplingRate').value;
      //ADVANCED
      parameters['TM.thetas_thr'] = this.formGroup.get('thetasThreshold').value;
    }

    //PREPROCESSING
    parameters['Preproc.minLemmas'] = this.preprocessingFormGroup.get('minLemmas').value;
    parameters['Preproc.noBelow'] = this.preprocessingFormGroup.get('noBelow').value;
    parameters['Preproc.noAbove'] = this.preprocessingFormGroup.get('noAbove').value;
    parameters['Preproc.keepN'] = this.preprocessingFormGroup.get('keepN').value;
    parameters['Preproc.stopwords'] = (this.preprocessingFormGroup.get('stopwords').value as string[]).join(',');
    parameters['Preproc.equivalences'] = (this.preprocessingFormGroup.get('equivalences').value as string[]).join(',');

    const model: any = {
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      corpusId: this.formGroup.get('corpus').value,
      type: this.formGroup.get('type').value,
      visibility: this.isPrivate ? "Private" : "Public",
      hierarchical: false,
      parameters
    }

    this.topicModelService.train(model).subscribe(
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
      this.formGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
    for (let param of this.advancedParamsForPreprocessing) {
      this.preprocessingFormGroup.get(param.name).setValue(param.default == undefined ? null : param.default);
    }
  }

}