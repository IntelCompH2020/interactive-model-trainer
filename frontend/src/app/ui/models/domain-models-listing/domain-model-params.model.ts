import { ModelParam } from "../model-parameters-table/model-parameters-table.component";

export function byKeywordsParams(advanced: boolean, type: string): ModelParam[] {
  if (!advanced) return [
    {
      name: 'method',
      realName: 'method',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.METHOD',
      type: 'select',
      default: 'count',
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.METHOD',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.METHOD-OPTIONS.EMBEDDING',
            value: 'embedding'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.METHOD-OPTIONS.COUNT',
            value: 'count'
          }
        ]
      }
    },
    {
      name: 'weightingFactor',
      realName: 'wt',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.WEIGHTING-FACTOR',
      type: 'number',
      default: 1.0,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.WEIGHTING-FACTOR',
      validation: {
        min: 1,
        max: 10,
        step: 1
      }
    },
    {
      name: 'numberOfElements',
      realName: 'n_max',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.NUMBER-OF-ELEMENTS',
      type: 'number',
      default: 2000,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-ELEMENTS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'minimumScore',
      realName: 's_min',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.MINIMUM-SCORE',
      type: 'number',
      default: 1,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.MINIMUM-SCORE',
      validation: {
        min: 0,
        max: 100,
        step: 0.01
      }
    },
    // {
    //   name: 'modelName',
    //   realName: 'model_name',
    //   displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.MODEL-NAME',
    //   type: 'rawselect',
    //   default: 'all-MiniLM-L6-v2',
    //   tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.MODEL-NAME',
    //   validation: {
    //     rawOptions: ['all-mpnet-base-v2', 'multi-qa-mpnet-base-dot-v1', 'all-distilroberta-v1', 'all-MiniLM-L12-v2', 'multi-qa-distilbert-cos-v1', 'all-MiniLM-L6-v2', 'multi-qa-MiniLM-L6-cos-v1', 'paraphrase-multilingual-mpnet-base-v2', 'paraphrase-albert-small-v2', 'paraphrase-multilingual-MiniLM-L12-v2', 'paraphrase-MiniLM-L3-v2', 'distiluse-base-multilingual-cased-v1', 'distiluse-base-multilingual-cased-v2']
    //   }
    // },
  ];
  else if (advanced && type === 'classifier') return classifierParams();
  else if (advanced && type === 'active_learning') return activeLearningParams();
  else return [];
}

export function byTopicsParams(advanced: boolean, type: string): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfElements',
      realName: 'n_max',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.NUMBER-OF-ELEMENTS',
      type: 'number',
      default: 4000,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-ELEMENTS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'minimumScore',
      realName: 's_min',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.MINIMUM-SCORE',
      type: 'number',
      default: 0.2,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.MINIMUM-SCORE',
      validation: {
        min: 0,
        max: 100,
        step: 0.01
      }
    }
  ];
  else if (advanced && type === 'classifier') return classifierParams();
  else if (advanced && type === 'active_learning') return activeLearningParams();
  else return [];
}

export function bySelectionFunctionParams(advanced: boolean, type: string): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfElements',
      realName: 'n_max',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.NUMBER-OF-ELEMENTS',
      type: 'number',
      default: 4000,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-ELEMENTS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'minimumScore',
      realName: 's_min',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS.MINIMUM-SCORE',
      type: 'number',
      default: 0.6,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.NEW-DOMAIN-MODEL-FROM-KEYWORDS-LIST-DIALOG.PARAMETERS-TOOLTIPS.MINIMUM-SCORE',
      validation: {
        min: 0,
        max: 100,
        step: 0.01
      }
    }
  ];
  else if (advanced && type === 'classifier') return classifierParams();
  else if (advanced && type === 'active_learning') return activeLearningParams();
  else return [];
}

export type DomainModelTrainer = "byKeywords" | "byTopics" | "bySelectionFunction" | "all";

function classifierParams(): ModelParam[] {
  return [
    {
      name: 'modelType',
      realName: 'model_type',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.MODEL-TYPE',
      type: 'rawselect',
      default: 'mpnet',
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.MODEL-TYPE',
      validation: {
        rawOptions: [
          'albert', 
          'bert', 
          'bertweet', 
          'bigbird', 
          'camembert', 
          'deberta', 
          'distilbert', 
          'electra', 
          'flaubert', 
          'herbert', 
          'layoutlm', 
          'layoutlmv2', 
          'longformer',
          'mpnet',
          'mobilebert',
          'rembert',
          'roberta',
          'squeezebert',
          'xlm',
          'xlmroberta',
          'xlnet'
        ]
      }
    },
    {
      name: 'modelName',
      realName: 'model_name',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.MODEL-NAME',
      type: 'rawselect',
      default: 'sentence-transformers/all-mpnet-base-v2',
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.MODEL-NAME',
      validation: {
        rawOptions: [
          'sentence-transformers/LaBSE', 
          'sentence-transformers/all-MiniLM-L12-v1', 
          'sentence-transformers/all-MiniLM-L12-v2', 
          'sentence-transformers/all-MiniLM-L6-v1', 
          'sentence-transformers/all-MiniLM-L6-v2', 
          'sentence-transformers/all-distilroberta-v1', 
          'sentence-transformers/all-mpnet-base-v1', 
          'sentence-transformers/all-mpnet-base-v2', 
          'sentence-transformers/all-roberta-large-v1', 
          'sentence-transformers/allenai-specter', 
          'sentence-transformers/average_word_embeddings_glove.6B.300d', 
          'sentence-transformers/average_word_embeddings_glove.840B.300d', 
          'sentence-transformers/average_word_embeddings_komninos',
          'sentence-transformers/average_word_embeddings_levy_dependency',
          'sentence-transformers/bert-base-nli-cls-token',
          'sentence-transformers/bert-base-nli-max-tokens',
          'sentence-transformers/bert-base-nli-mean-tokens',
          'sentence-transformers/bert-base-nli-stsb-mean-tokens',
          'sentence-transformers/bert-base-wikipedia-sections-mean-tokens',
          'sentence-transformers/bert-large-nli-cls-token',
          'sentence-transformers/bert-large-nli-max-tokens',
          'sentence-transformers/bert-large-nli-mean-tokens',
          'sentence-transformers/bert-large-nli-stsb-mean-tokens',
          'sentence-transformers/clip-ViT-B-16',
          'sentence-transformers/clip-ViT-B-32',
          'sentence-transformers/clip-ViT-B-32-multilingual-v1',
          'sentence-transformers/clip-ViT-L-14',
          'sentence-transformers/distilbert-base-nli-max-tokens',
          'sentence-transformers/distilbert-base-nli-mean-tokens',
          'sentence-transformers/distilbert-base-nli-stsb-mean-tokens',
          'sentence-transformers/distilbert-base-nli-stsb-quora-ranking',
          'sentence-transformers/distilbert-multilingual-nli-stsb-quora-ranking',
          'sentence-transformers/distilroberta-base-msmarco-v1',
          'sentence-transformers/distilroberta-base-msmarco-v2',
          'sentence-transformers/distilroberta-base-paraphrase-v1',
          'sentence-transformers/distiluse-base-multilingual-cased',
          'sentence-transformers/distiluse-base-multilingual-cased-v1',
          'sentence-transformers/distiluse-base-multilingual-cased-v2',
          'sentence-transformers/facebook-dpr-ctx_encoder-multiset-base',
          'sentence-transformers/facebook-dpr-ctx_encoder-single-nq-base',
          'sentence-transformers/facebook-dpr-question_encoder-multiset-base',
          'sentence-transformers/facebook-dpr-question_encoder-single-nq-base',
          'sentence-transformers/gtr-t5-base',
          'sentence-transformers/gtr-t5-large',
          'sentence-transformers/gtr-t5-xl',
          'sentence-transformers/gtr-t5-xxl',
          'sentence-transformers/msmarco-MiniLM-L-12-v3',
          'sentence-transformers/msmarco-MiniLM-L-6-v3',
          'sentence-transformers/msmarco-MiniLM-L12-cos-v5',
          'sentence-transformers/msmarco-MiniLM-L6-cos-v5',
          'sentence-transformers/msmarco-bert-base-dot-v5',
          'sentence-transformers/msmarco-bert-co-condensor',
          'sentence-transformers/msmarco-distilbert-base-dot-prod-v3',
          'sentence-transformers/msmarco-distilbert-base-tas-b',
          'sentence-transformers/msmarco-distilbert-base-v2',
          'sentence-transformers/msmarco-distilbert-base-v3',
          'sentence-transformers/msmarco-distilbert-base-v4',
          'sentence-transformers/msmarco-distilbert-cos-v5',
          'sentence-transformers/msmarco-distilbert-dot-v5',
          'sentence-transformers/msmarco-distilbert-multilingual-en-de-v2-tmp-lng-aligned',
          'sentence-transformers/msmarco-distilbert-multilingual-en-de-v2-tmp-trained-scratch',
          'sentence-transformers/msmarco-distilroberta-base-v2',
          'sentence-transformers/msmarco-roberta-base-ance-firstp',
          'sentence-transformers/msmarco-roberta-base-v2',
          'sentence-transformers/msmarco-roberta-base-v3',
          'sentence-transformers/multi-qa-MiniLM-L6-cos-v1',
          'sentence-transformers/multi-qa-MiniLM-L6-dot-v1',
          'sentence-transformers/multi-qa-distilbert-cos-v1',
          'sentence-transformers/multi-qa-distilbert-dot-v1',
          'sentence-transformers/multi-qa-mpnet-base-cos-v1',
          'sentence-transformers/multi-qa-mpnet-base-dot-v1',
          'sentence-transformers/nli-bert-base',
          'sentence-transformers/nli-bert-base-cls-pooling',
          'sentence-transformers/nli-bert-base-max-pooling',
          'sentence-transformers/nli-bert-large',
          'sentence-transformers/nli-bert-large-cls-pooling',
          'sentence-transformers/nli-bert-large-max-pooling',
          'sentence-transformers/nli-distilbert-base',
          'sentence-transformers/nli-distilbert-base-max-pooling',
          'sentence-transformers/nli-distilroberta-base-v2',
          'sentence-transformers/nli-mpnet-base-v2',
          'sentence-transformers/nli-roberta-base',
          'sentence-transformers/nli-roberta-base-v2',
          'sentence-transformers/nli-roberta-large',
          'sentence-transformers/nq-distilbert-base-v1',
          'sentence-transformers/paraphrase-MiniLM-L12-v2',
          'sentence-transformers/paraphrase-MiniLM-L3-v2',
          'sentence-transformers/paraphrase-MiniLM-L6-v2',
          'sentence-transformers/paraphrase-TinyBERT-L6-v2',
          'sentence-transformers/paraphrase-albert-base-v2',
          'sentence-transformers/paraphrase-albert-small-v2',
          'sentence-transformers/paraphrase-distilroberta-base-v1',
          'sentence-transformers/paraphrase-distilroberta-base-v2',
          'sentence-transformers/paraphrase-mpnet-base-v2',
          'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
          'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
          'sentence-transformers/paraphrase-xlm-r-multilingual-v1',
          'sentence-transformers/quora-distilbert-base',
          'sentence-transformers/quora-distilbert-multilingual',
          'sentence-transformers/roberta-base-nli-mean-tokens'
        ]
      }
    },
    {
      name: 'maximumImbalance',
      realName: 'max_imbalance',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.MAX-IMBALANCE',
      type: 'number',
      default: 3,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.MAX-IMBALANCE',
      validation: {
        min: 0,
        max: 100,
        step: 1
      }
    },
    {
      name: 'nmax',
      realName: 'nmax',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.NMAX',
      type: 'number',
      default: 400,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.NMAX',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'freezeEncoder',
      realName: 'freeze_encoder',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.FREEZE-ENCODER',
      type: 'select',
      default: 'True',
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.FREEZE-ENCODER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.FREEZE-ENCODER-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.FREEZE-ENCODER-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'epochs',
      realName: 'epochs',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.EPOCHS',
      type: 'number',
      default: 5,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.EPOCHS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'batchSize',
      realName: 'batch_size',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.BATCH-SIZE',
      type: 'number',
      default: 8,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.BATCH-SIZE',
      validation: {
        min: 1,
        max: 128,
        step: 1
      }
    }
  ];
}

function activeLearningParams(): ModelParam[] {
  return [
    {
      name: 'nDocs',
      realName: 'n_docs',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.N-DOCS',
      type: 'number',
      default: 8,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS-TOOLTIPS.N-DOCS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    },
    {
      name: 'sampler',
      realName: 'sampler',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER',
      type: 'select',
      default: 'extremes',
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS-TOOLTIPS.SAMPLER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER-OPTIONS.EXTREMES',
            value: 'extremes'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER-OPTIONS.RANDOM',
            value: 'random'
          }
        ]
      }
    },
    {
      name: 'pRatio',
      realName: 'p_ratio',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.P-RATIO',
      type: 'number',
      default: 0.8,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS-TOOLTIPS.P-RATIO',
      validation: {
        min: 0.01,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'topProb',
      realName: 'top_prob',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.TOP-PROB',
      type: 'number',
      default: 0.1,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS-TOOLTIPS.TOP-PROB',
      validation: {
        min: 0,
        max: 1,
        step: 0.01
      }
    },
  ];
}

export function retrainParams(): ModelParam[] {
  return [
    {
      name: 'epochs',
      realName: 'epochs',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS.EPOCHS',
      type: 'number',
      default: 5,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.CLASSIFIER-PARAMETERS-TOOLTIPS.EPOCHS',
      validation: {
        min: 1,
        max: 100000,
        step: 1
      }
    }
  ];
}

export function evaluateParams(): ModelParam[] {
  return [
    {
      name: 'trueLabelName',
      realName: 'true_label_name',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.EVALUATE-PARAMETERS.TRUE-LABEL-NAME',
      type: 'string',
      default: "",
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.EVALUATE-PARAMETERS-TOOLTIPS.TRUE-LABEL-NAME',
      validation: {}
    }
  ];
}

export function samplingParams(): ModelParam[] {
  return [
    {
      name: 'sampler',
      realName: 'sampler',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER',
      type: 'select',
      default: null,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS-TOOLTIPS.SAMPLER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER-OPTIONS.NONE',
            value: null
          },
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER-OPTIONS.EXTREMES',
            value: 'extremes'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.ACTIVE-LEARNING-PARAMETERS.SAMPLER-OPTIONS.RANDOM',
            value: 'random'
          }
        ]
      }
    },
    {
      name: 'numOfDocuments',
      realName: 'n_samples',
      displayName: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.SAMPLING-PARAMETERS.NUM-OF-DOCUMENTS',
      type: 'number',
      default: 8,
      tooltip: 'APP.MODELS-COMPONENT.DOMAIN-MODELS-LISTING-COMPONENT.SAMPLING-PARAMETERS-TOOLTIPS.NUM-OF-DOCUMENTS',
      validation: {
        min: 1
      }
    },
  ];
}