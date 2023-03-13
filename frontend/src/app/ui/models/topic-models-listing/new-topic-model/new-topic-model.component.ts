import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { TopicModelSubtype } from '@app/core/enum/topic-model-subtype.enum';
import { TopicModelType } from '@app/core/enum/topic-model.-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { TranslateService } from '@ngx-translate/core';
import { nameof } from 'ts-simple-nameof';
import { TopicModelEditorModel } from './topic-model-editor.model';
import { CTMParams, malletParams, prodLDAParams, sparkLDAParams, TopicModelParam } from '../topic-model-params.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';

@Component({
  selector: 'app-new-topic-model',
  templateUrl: './new-topic-model.component.html',
  styleUrls: ['./new-topic-model.component.scss']
})
export class NewTopicModelComponent implements OnInit {

  availableTypes: TopicModelType[];

  availableCorpora: string[];

  TopicModelType = TopicModelType;
  selectedType: TopicModelType = TopicModelType.mallet;
  selectedCorpus: string = undefined;

  editorModel: TopicModelEditorModel;
  formGroup: FormGroup;

  advanced: boolean = false;

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<TopicModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  get params(): TopicModelParam[] {
    if (this.selectedType == TopicModelType.mallet) return malletParams(false);
    else if (this.selectedType == TopicModelType.prodLDA) return prodLDAParams(false);
    else if (this.selectedType == TopicModelType.CTM) return CTMParams(false);
    else if (this.selectedType == TopicModelType.sparkLDA) return sparkLDAParams(false);
    return [];
  }

  get advancedParams(): TopicModelParam[] {
    if (this.selectedType == TopicModelType.mallet) return malletParams(true);
    else if (this.selectedType == TopicModelType.prodLDA) return prodLDAParams(true);
    else if (this.selectedType == TopicModelType.CTM) return CTMParams(true);
    else if (this.selectedType == TopicModelType.sparkLDA) return sparkLDAParams(true);
    return [];
  }

  constructor(
    private dialogRef: MatDialogRef<NewTopicModelComponent>,
    public enumUtils: AppEnumUtils,
    private topicModelService: TopicModelService,
    private corpusService: LogicalCorpusService,
    protected formBuilder: FormBuilder = new FormBuilder(),
    public translate: TranslateService,
    protected modelSelectionService: ModelSelectionService
  ) {
    this.availableTypes = this.enumUtils.getEnumValues<TopicModelType>(TopicModelType);
    this.availableTypes = this.availableTypes.filter(t => t !== TopicModelType.all);
  
    const lookup = new LogicalCorpusLookup();
    lookup.project = {fields: [nameof<LogicalCorpus>(x => x.name)]};
    lookup.corpusValidFor = "TM";
    this.corpusService.query(lookup).subscribe((response) => {
      const corpora = response.items;
      this.availableCorpora = corpora.map(corpus => corpus.name)
    })
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new TopicModelEditorModel();
      this.formGroup = this.editorModel.buildForm(null, false, this.selectedType);
      this.formGroup.get('type').setValue(this.selectedType);
      let corpusToSet: string = (this.modelSelectionService.corpus?.name && this.modelSelectionService.corpus?.valid_for === "TM") ? this.modelSelectionService.corpus?.name : "";
      if (this.selectedCorpus) corpusToSet = this.selectedCorpus;
      this.formGroup.get('corpus').setValue(corpusToSet);
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
          model,
          task: response.id
        });
      },
      error => {
        console.error(error);
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
  }

}