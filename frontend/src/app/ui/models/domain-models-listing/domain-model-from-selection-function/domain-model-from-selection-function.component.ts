import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DomainModelSubType, DomainModelType } from '@app/core/enum/domain-model-type.enum';
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
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { nameof } from 'ts-simple-nameof';
import { DomainModelEditorModel } from '../domain-model-editor.model';

@Component({
  templateUrl: './domain-model-from-selection-function.component.html',
  styleUrls: ['./domain-model-from-selection-function.component.scss']
})
export class DomainModelFromSelectionFunctionComponent implements OnInit {

  availableTypes: DomainModelType[];
  availableSubTypes: DomainModelSubType[];

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
  topicWeightsFormGroup: FormGroup;

  advanced: boolean = false;

  get valid() {
    return this.formGroup?.valid && this.topicWeightsFormGroup?.valid;
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

  constructor(
    private dialogRef: MatDialogRef<DomainModelFromSelectionFunctionComponent>,
    public enumUtils: AppEnumUtils,
    private formBuilder: FormBuilder,
    private corpusService: LogicalCorpusService,
    private topicModelService: TopicModelService,
    protected modelSelectionService: ModelSelectionService
  ) {
    this.availableSubTypes = this.enumUtils.getEnumValues<DomainModelSubType>(DomainModelSubType);
    this.availableTypes = this.enumUtils.getEnumValues<DomainModelType>(DomainModelType);

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
      this.corpusInput.disable();
      this.topicWeightsFormGroup = this.formBuilder.group({
        weights: this.formBuilder.array([])
      });
      this.topicWeightsFormGroup.valueChanges.subscribe((value) => {
        this.topicWeights = value.weights;
      });

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