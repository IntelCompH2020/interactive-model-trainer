import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { TopicModelSubtype } from '@app/core/enum/topic-model-subtype.enum';
import { TopicModelType } from '@app/core/enum/topic-model.-type.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';

export interface TopicModel extends BaseEntity {
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
  TrDtSet: string;
  parentName?: string;
  hierarchyLevel: number;
  topicId?: number;
  thr?: number;
	htm?: string;

  treeStatus?: TopicModelTreeStatus;
}

export type TopicModelTreeStatus = 'collapsed' | 'expanded' | 'disabled';

export interface TopicModelListing extends TopicModel {
  submodels: TopicModel[];
}

export interface TopicModelPersist extends BaseEntityPersist {
  name: string;
  description: string;
  type: TopicModelType;
  subtype: TopicModelSubtype;
  numberOfTopics?: number;
  numberOfIterations?: number;
  visibility?: ModelVisibility;
  creator: string;
  creation_date: Date;
  location: string;
  corpus?: string;
}

export interface Topic {
  id: number;
  size: string;
  label: string;
  wordDescription: string;
  docsActive: string;
  topicEntropy: string;
  topicCoherence: string;
}

export interface TopicSimilarity {
  Coocurring: any[][];
  Worddesc: any[][];
}