import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { TopicModel, TopicModelPersist } from '@app/core/model/model/topic-model.model';
import { TopicModelSubtype } from '@app/core/enum/topic-model-subtype.enum';
import { TopicModelType } from '@app/core/enum/topic-model.-type.enum';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { determineValidation, TopicModelTrainer } from '../topic-model-params.model';

export class HierarchicalTopicModelEditorModel extends BaseEditorModel implements TopicModelPersist {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
	name: string;
	description: string;
	type: TopicModelType;
	subtype: TopicModelSubtype;

	numberOfTopics?: number;
	alpha?: number;
	numberOfIterations?: number;
	optimizeInterval?: number;
	documentTopicsThreshold?: number;
	numberOfThreads?: number;
	maxIterations?: number;
	optimizer?: string;
	optimizeDocConcentration?: boolean;
	subsamplingRate?: number;
	modelType?: string;
	numberOfEpochs?: number;
	batchSize?: number;

	thetasThreshold?: number;
	tokenRegEx?: string;
	numberOfIterationsInf?: number;
	labels?: string;
  hidenSizes?: string;
  activation?: string;
	dropout?: number;
  learnPriors?: string;
  lr?: number;
  momentum?: number;
  solver?: string;
  reduceOnPlateau?: string;
	topicPriorMean?: number;
  topicPriorVariance?: number;
  numberOfSamples?: number;
  numberOfDataLoaderWorkers?: number;
	ctmModelType?: string;
  labelSize?: number;
  lossWeights?: string;
  sbertModel?: string;

	visibility?: ModelVisibility;
	creator: string;
	creation_date: Date;
	location: string;
	corpus?: string;
	parentName: string;
	topicId?: number;
	thr?: number;
	htm?: string;


	public fromModel(item: TopicModel): HierarchicalTopicModelEditorModel {
		if (item) {
			super.fromModel(item);
			this.name = item.name;
			this.description = item.description;
			this.type = item.type;
			this.subtype = item.subtype;

			this.numberOfTopics = item.numberOfTopics;
			this.alpha = item.alpha;
			this.numberOfIterations = item.numberOfIterations;
			this.optimizeInterval = item.optimizeInterval;
			this.documentTopicsThreshold = item.documentTopicsThreshold;
			this.numberOfThreads = item.numberOfThreads;
			this.maxIterations = item.maxIterations;
			this.optimizer = item.optimizer;
			this.optimizeDocConcentration = item.optimizeDocConcentration;
			this.subsamplingRate = item.subsamplingRate;
			this.modelType = item.modelType;
			this.numberOfEpochs = item.numberOfEpochs;
			this.batchSize = item.batchSize;

			this.thetasThreshold = item.thetasThreshold;
			this.tokenRegEx = item.tokenRegEx;
			this.numberOfIterationsInf = item.numberOfIterationsInf;
			this.labels = item.labels;
			this.hidenSizes = item.hidenSizes;
			this.activation = item.activation;
			this.dropout = item.dropout;
			this.learnPriors = item.learnPriors;
			this.lr = item.lr;
			this.momentum = item.momentum;
			this.solver = item.solver;
			this.reduceOnPlateau = item.reduceOnPlateau;
			this.topicPriorMean = item.topicPriorMean;
			this.topicPriorVariance = item.topicPriorVariance;
			this.numberOfSamples = item.numberOfSamples;
			this.numberOfDataLoaderWorkers = item.numberOfDataLoaderWorkers;
			this.ctmModelType = item.ctmModelType;
			this.labelSize = item.labelSize;
			this.lossWeights = item.lossWeights;
			this.sbertModel = item.sbertModel;

			this.visibility = item.visibility;
			this.creator = item.creator;
			this.creation_date = item.creation_date;
			this.location = item.location;
			this.corpus = item.TrDtSet;
			this.parentName = item.parentName;
			this.topicId = item.topicId;
			this.thr = item.thr;
			this.htm = item.htm;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false, trainer: TopicModelTrainer = 'mallet'): FormGroup {
		if (context == null) { context = this.createValidationContext(trainer); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			location: [{ value: this.location, disabled: disabled }, context.getValidation('location').validators],
			creator: [{ value: this.creator, disabled: disabled }, context.getValidation('creator').validators],
			creation_date: [{ value: this.creation_date, disabled: disabled }, context.getValidation('creation_date').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],

			type: [{ value: this.type, disabled: disabled }, context.getValidation('type').validators],
			subtype: [{ value: this.subtype, disabled: disabled }, context.getValidation('subtype').validators],

			numberOfTopics: [{ value: this.numberOfTopics, disabled: disabled }, context.getValidation('numberOfTopics').validators],
			alpha: [{ value: this.alpha, disabled: disabled }, context.getValidation('alpha').validators],
			numberOfIterations: [{ value: this.numberOfIterations, disabled: disabled }, context.getValidation('numberOfIterations').validators],
			optimizeInterval: [{ value: this.optimizeInterval, disabled: disabled }, context.getValidation('optimizeInterval').validators],
			documentTopicsThreshold: [{ value: this.documentTopicsThreshold, disabled: disabled }, context.getValidation('documentTopicsThreshold').validators],
			numberOfThreads: [{ value: this.numberOfThreads, disabled: disabled }, context.getValidation('numberOfThreads').validators],
			maxIterations: [{ value: this.maxIterations, disabled: disabled }, context.getValidation('maxIterations').validators],
			optimizer: [{ value: this.optimizer, disabled: disabled }, context.getValidation('optimizer').validators],
			optimizeDocConcentration: [{ value: this.optimizeDocConcentration, disabled: disabled }, context.getValidation('optimizeDocConcentration').validators],
			subsamplingRate: [{ value: this.subsamplingRate, disabled: disabled }, context.getValidation('subsamplingRate').validators],
			modelType: [{ value: this.modelType, disabled: disabled }, context.getValidation('modelType').validators],
			numberOfEpochs: [{ value: this.numberOfEpochs, disabled: disabled }, context.getValidation('numberOfEpochs').validators],
			batchSize: [{ value: this.batchSize, disabled: disabled }, context.getValidation('batchSize').validators],

			thetasThreshold: [{ value: this.thetasThreshold, disabled: disabled }, context.getValidation('thetasThreshold').validators],
			tokenRegEx: [{ value: this.tokenRegEx, disabled: disabled }, context.getValidation('tokenRegEx').validators],
			numberOfIterationsInf: [{ value: this.numberOfIterationsInf, disabled: disabled }, context.getValidation('numberOfIterationsInf')],
			labels: [],
			hidenSizes: [{ value: this.hidenSizes, disabled: disabled }, context.getValidation('hidenSizes').validators],
			activation: [{ value: this.activation, disabled: disabled }, context.getValidation('activation').validators],
			dropout: [{ value: this.dropout, disabled: disabled }, context.getValidation('dropout')],
  		learnPriors: [{ value: this.learnPriors, disabled: disabled }, context.getValidation('learnPriors')],
  		lr: [{ value: this.lr, disabled: disabled }, context.getValidation('lr')],
  		momentum: [{ value: this.momentum, disabled: disabled }, context.getValidation('momentum')],
  		solver: [{ value: this.solver, disabled: disabled }, context.getValidation('solver')],
  		reduceOnPlateau: [{ value: this.reduceOnPlateau, disabled: disabled }, context.getValidation('reduceOnPlateau')],
			topicPriorMean: [{ value: this.topicPriorMean, disabled: disabled }, context.getValidation('topicPriorMean')],
  		topicPriorVariance: [{ value: this.topicPriorVariance, disabled: disabled }, context.getValidation('topicPriorVariance')],
  		numberOfSamples: [{ value: this.numberOfSamples, disabled: disabled }, context.getValidation('numberOfSamples')],
  		numberOfDataLoaderWorkers: [{ value: this.numberOfDataLoaderWorkers, disabled: disabled }, context.getValidation('numberOfDataLoaderWorkers')],
			ctmModelType: [{ value: this.ctmModelType, disabled: disabled }, context.getValidation('ctmModelType')],
  		labelSize: [{ value: this.labelSize, disabled: disabled }, context.getValidation('labelSize')],
  		lossWeights: [{ value: this.lossWeights, disabled: disabled }, context.getValidation('lossWeights')],
  		sbertModel: [{ value: this.sbertModel, disabled: disabled }, context.getValidation('sbertModel')],

			corpus: [{ value: this.corpus, disabled: disabled }, context.getValidation('corpus').validators],
			parentName: [{ value: this.parentName, disabled }, context.getValidation('parentName').validators],
			topicId: [{ value: this.topicId, disabled }, context.getValidation('topicId').validators],
			thr: [{ value: this.thr, disabled: disabled }, context.getValidation('thr').validators],
			htm: [{ value: this.htm, disabled: disabled }, context.getValidation('htm').validators],

			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(trainer: TopicModelTrainer): ValidationContext {

		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
		baseValidationArray.push({ key: 'description', validators: [] });
		baseValidationArray.push({ key: 'creator', validators: [] });
		baseValidationArray.push({ key: 'creation_date', validators: [] });
		baseValidationArray.push({ key: 'location', validators: [] });
		baseValidationArray.push({ key: 'visibility', validators: [] });

		baseValidationArray.push({ key: 'type', validators: [Validators.required] });
		baseValidationArray.push({ key: 'subtype', validators: [] });

		baseValidationArray.push({ key: 'numberOfTopics', validators: [...determineValidation(trainer, 'numberOfTopics')] });
		baseValidationArray.push({ key: 'alpha', validators: [...determineValidation(trainer, 'alpha')] });
		baseValidationArray.push({ key: 'numberOfIterations', validators: [...determineValidation(trainer, 'numberOfIterations')] });
		baseValidationArray.push({ key: 'optimizeInterval', validators: [...determineValidation(trainer, 'optimizeInterval')] });
		baseValidationArray.push({ key: 'documentTopicsThreshold', validators: [...determineValidation(trainer, 'documentTopicsThreshold')] });
		baseValidationArray.push({ key: 'numberOfThreads', validators: [...determineValidation(trainer, 'numberOfThreads')] });
		baseValidationArray.push({ key: 'maxIterations', validators: [...determineValidation(trainer, 'maxIterations')] });
		baseValidationArray.push({ key: 'optimizer', validators: [...determineValidation(trainer, 'optimizer')] });
		baseValidationArray.push({ key: 'optimizeDocConcentration', validators: [...determineValidation(trainer, 'optimizeDocConcentration')] });
		baseValidationArray.push({ key: 'subsamplingRate', validators: [...determineValidation(trainer, 'subsamplingRate')] });
		baseValidationArray.push({ key: 'modelType', validators: [...determineValidation(trainer, 'modelType')] });
		baseValidationArray.push({ key: 'numberOfEpochs', validators: [...determineValidation(trainer, 'numberOfEpochs')] });
		baseValidationArray.push({ key: 'batchSize', validators: [...determineValidation(trainer, 'batchSize')] });

		baseValidationArray.push({ key: 'thetasThreshold', validators: [...determineValidation(trainer, 'thetasThreshold')] });
		baseValidationArray.push({ key: 'tokenRegEx', validators: [...determineValidation(trainer, 'tokenRegEx')] });
		baseValidationArray.push({ key: 'numberOfIterationsInf', validators: [...determineValidation(trainer, 'numberOfIterationsInf')] });
		baseValidationArray.push({ key: 'labels', validators: [...determineValidation(trainer, 'labels')] });
		baseValidationArray.push({ key: 'hidenSizes', validators: [...determineValidation(trainer, 'hidenSizes')] });
		baseValidationArray.push({ key: 'activation', validators: [...determineValidation(trainer, 'activation')] });
		baseValidationArray.push({ key: 'dropout', validators: [...determineValidation(trainer, 'dropout')] });
		baseValidationArray.push({ key: 'learnPriors', validators: [...determineValidation(trainer, 'learnPriors')] });
		baseValidationArray.push({ key: 'lr', validators: [...determineValidation(trainer, 'lr')] });
		baseValidationArray.push({ key: 'momentum', validators: [...determineValidation(trainer, 'momentum')] });
		baseValidationArray.push({ key: 'solver', validators: [...determineValidation(trainer, 'solver')] });
		baseValidationArray.push({ key: 'reduceOnPlateau', validators: [...determineValidation(trainer, 'reduceOnPlateau')] });
		baseValidationArray.push({ key: 'topicPriorMean', validators: [...determineValidation(trainer, 'topicPriorMean')] });
		baseValidationArray.push({ key: 'topicPriorVariance', validators: [...determineValidation(trainer, 'topicPriorVariance')] });
		baseValidationArray.push({ key: 'numberOfSamples', validators: [...determineValidation(trainer, 'numberOfSamples')] });
		baseValidationArray.push({ key: 'numberOfDataLoaderWorkers', validators: [...determineValidation(trainer, 'numberOfDataLoaderWorkers')] });
		baseValidationArray.push({ key: 'ctmModelType', validators: [...determineValidation(trainer, 'ctmModelType')] });
		baseValidationArray.push({ key: 'labelSize', validators: [...determineValidation(trainer, 'labelSize')] });
		baseValidationArray.push({ key: 'lossWeights', validators: [...determineValidation(trainer, 'lossWeights')] });
		baseValidationArray.push({ key: 'sbertModel', validators: [...determineValidation(trainer, 'sbertModel')] });

		baseValidationArray.push({ key: 'corpus', validators: [] });
		baseValidationArray.push({ key: 'parentName', validators: [Validators.required] });
		baseValidationArray.push({ key: 'topicId', validators: [Validators.required] });
		baseValidationArray.push({ key: 'thr', validators: [Validators.required, Validators.min(0.01), Validators.max(1)] });
		baseValidationArray.push({ key: 'htm', validators: [Validators.required] });

		baseValidationArray.push({ key: 'hash', validators: [] });

		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}