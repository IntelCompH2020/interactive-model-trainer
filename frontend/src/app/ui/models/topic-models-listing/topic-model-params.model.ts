import { ValidatorFn, Validators } from "@angular/forms";
import { ModelParam } from "../model-parameters-table/model-parameters-table.component";

export function malletParams(advanced: boolean): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfTopics',
      realName: 'ntopics',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-TOPICS',
      type: 'number',
      default: 25,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-TOPICS-MALLET',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'alpha',
      realName: 'alpha',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ALPHA',
      type: 'number',
      default: 5.0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.ALPHA-MALLET',
      validation: {
        min: 1.0,
        max: 1000.0,
        step: 0.1
      }
    },
    {
      name: 'numberOfIterations',
      realName: 'num_iterations',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-ITERATIONS',
      type: 'number',
      default: 1000,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-ITERATIONS',
      validation: {
        min: 1,
        max: 10000,
        step: 1
      }
    },
    {
      name: 'optimizeInterval',
      realName: 'optimize_interval',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZE-INTERVAL',
      type: 'number',
      default: 10,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.OPTIMIZE-INTERVAL',
      validation: {
        min: 0,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'documentTopicsThreshold',
      realName: 'doc_topic_thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.DOCUMENT-TOPICS-THRESHOLD',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.DOCUMENT-TOPICS-THRESHOLD',
      validation: {
        min: 0,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'numberOfThreads',
      realName: 'num_threads',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-THREADS',
      type: 'number',
      default: 4,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-THREADS',
      validation: {
        min: 1,
        max: 128,
        step: 1
      }
    },
  ];
  else return [
    {
      name: 'thetasThreshold',
      realName: 'thetas_thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.THETAS-THRESHOLD',
      type: 'number',
      default: 0.003,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.THETAS-THRESHOLD',
      validation: {
        min: 0.001,
        max: 1,
        step: 0.001
      }
    },
    {
      name: 'tokenRegEx',
      realName: 'token_regexp',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.TOKEN-REGEX',
      type: 'string',
      default: '[\\p{L}\\p{N}][\\p{L}\\p{N}\\p{P}]*\\p{L}',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.TOKEN-REGEX',
      validation: {}
    },
    {
      name: 'numberOfIterationsInf',
      realName: 'num_iterations_inf',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-ITERATIONS-INF',
      type: 'number',
      default: 100,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-ITERATIONS-INF',
      validation: {
        min: 1,
        max: 10000,
        step: 1
      }
    },
  ];
}

export function prodLDAParams(advanced: boolean): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfTopics',
      realName: 'ntopics',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-TOPICS',
      type: 'number',
      default: 25,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-TOPICS-AVITM',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'modelType',
      realName: 'model_type',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE',
      type: 'select',
      default: 'ProdLDA',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.MODEL-TYPE-AVITM',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE-OPTIONS.LDA',
            value: 'LDA'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE-OPTIONS.PROD-LDA',
            value: 'ProdLDA'
          }
        ]
      }
    },
    {
      name: 'numberOfEpochs',
      realName: 'num_epochs',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-EPOCHS',
      type: 'number',
      default: 100,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-EPOCHS',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'batchSize',
      realName: 'batch_size',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.BATCH-SIZE',
      type: 'number',
      default: 64,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.BATCH-SIZE',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
  ];
  else return [
    {
      name: 'thetasThreshold',
      realName: 'thetas_thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.THETAS-THRESHOLD',
      type: 'number',
      default: 0.003,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.THETAS-THRESHOLD',
      validation: {
        min: 0.001,
        max: 1,
        step: 0.001
      }
    },
    {
      name: 'hidenSizes',
      realName: 'hidden_sizes',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.HIDEN-SIZES',
      type: 'string',
      default: '(100,100)',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.HIDEN-SIZES',
      validation: {}
    },
    {
      name: 'activation',
      realName: 'activation',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION',
      type: 'select',
      default: 'softplus',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.ACTIVATION',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SOFTPLUS',
            value: 'softplus'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.RELU',
            value: 'relu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SIGMOID',
            value: 'sigmoid'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.LEAKYRELU',
            value: 'leakyrelu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.RRELU',
            value: 'rrelu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.ELU',
            value: 'elu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SELU',
            value: 'selu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.TANH',
            value: 'tanh'
          },
        ]
      }
    },
    {
      name: 'dropout',
      realName: 'dropout',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.DROPOUT',
      type: 'number',
      default: 0.2,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.DROPOUT',
      validation: {
        min: 0,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'learnPriors',
      realName: 'learn_priors',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS',
      type: 'select',
      default: 'True',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LEARN-PRIORS',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'lr',
      realName: 'lr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LR',
      type: 'number',
      default: 0.002,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LR',
      validation: {
        min: 0,
        max: 1,
        step: 0.001
      }
    },
    {
      name: 'momentum',
      realName: 'momentum',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MOMENTUM',
      type: 'number',
      default: 0.99,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.MOMENTUM',
      validation: {
        min: 0,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'solver',
      realName: 'solver',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER',
      type: 'select',
      default: 'adam',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.SOLVER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADAGRAD',
            value: 'adagrad'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADAM',
            value: 'adam'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.SGD',
            value: 'sgd'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADADELTA',
            value: 'adadelta'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.RMSPROP',
            value: 'rmsprop'
          }
        ]
      }
    },
    {
      name: 'reduceOnPlateau',
      realName: 'reduce_on_plateau',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU',
      type: 'select',
      default: 'False',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.REDUCE-ON-PLATEAU',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'topicPriorMean',
      realName: 'topic_prior_mean',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.TOPIC-PRIOR-MEAN',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.TOPIC-PRIOR-MEAN',
      validation: {
        step: 0.1
      }
    },
    {
      name: 'topicPriorVariance',
      realName: 'topic_prior_variance',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.TOPIC-PRIOR-VARIANCE',
      type: 'number',
      default: null,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.TOPIC-PRIOR-VARIANCE',
      validation: {
        step: 0.1
      }
    },
    {
      name: 'numberOfSamples',
      realName: 'num_samples',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-SAMPLES',
      type: 'number',
      default: 10,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-SAMPLES',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'numberOfDataLoaderWorkers',
      realName: 'num_data_loader_workers',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-DALA-LOADER-WORKERS',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-DALA-LOADER-WORKERS',
      validation: {
        min: 0,
        max: 128,
        step: 1
      }
    }
  ];
}

export function CTMParams(advanced: boolean): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfTopics',
      realName: 'ntopics',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-TOPICS',
      type: 'number',
      default: 25,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-TOPICS-CTM',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'modelType',
      realName: 'model_type',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE',
      type: 'select',
      default: 'ProdLDA',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.MODEL-TYPE-CTM',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE-OPTIONS.LDA',
            value: 'LDA'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MODEL-TYPE-OPTIONS.PROD-LDA',
            value: 'ProdLDA'
          }
        ]
      }
    },
    {
      name: 'numberOfEpochs',
      realName: 'num_epochs',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-EPOCHS',
      type: 'number',
      default: 100,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-EPOCHS',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'batchSize',
      realName: 'batch_size',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.BATCH-SIZE',
      type: 'number',
      default: 64,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.BATCH-SIZE',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
  ];
  else return [
    {
      name: 'thetasThreshold',
      realName: 'thetas_thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.THETAS-THRESHOLD',
      type: 'number',
      default: 0.003,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.THETAS-THRESHOLD',
      validation: {
        min: 0.001,
        max: 1,
        step: 0.001
      }
    },
    {
      name: 'ctmModelType',
      realName: 'ctm_model_type',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.CTM-MODEL-TYPE',
      type: 'select',
      default: 'CombinedTM',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.CTM-MODEL-TYPE',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.CTM-MODEL-TYPE-OPTIONS.COMBINED',
            value: 'CombinedTM'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.CTM-MODEL-TYPE-OPTIONS.ZERO-SHOT',
            value: 'ZeroShotTM'
          }
        ]
      }
    },
    {
      name: 'hidenSizes',
      realName: 'hidden_sizes',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.HIDEN-SIZES',
      type: 'string',
      default: '(100,100)',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.HIDEN-SIZES',
      validation: {}
    },
    {
      name: 'activation',
      realName: 'activation',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION',
      type: 'select',
      default: 'softplus',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.ACTIVATION',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SOFTPLUS',
            value: 'softplus'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.RELU',
            value: 'relu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SIGMOID',
            value: 'sigmoid'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.LEAKYRELU',
            value: 'leakyrelu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.RRELU',
            value: 'rrelu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.ELU',
            value: 'elu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.SELU',
            value: 'selu'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ACTIVATION-OPTIONS.TANH',
            value: 'tanh'
          },
        ]
      }
    },
    {
      name: 'dropout',
      realName: 'dropout',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.DROPOUT',
      type: 'number',
      default: 0.2,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.DROPOUT',
      validation: {
        min: 0,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'learnPriors',
      realName: 'learn_priors',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS',
      type: 'select',
      default: 'True',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LEARN-PRIORS',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LEARN-PRIORS-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'lr',
      realName: 'lr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LR',
      type: 'number',
      default: 0.002,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LR',
      validation: {
        min: 0,
        max: 1,
        step: 0.001
      }
    },
    {
      name: 'momentum',
      realName: 'momentum',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MOMENTUM',
      type: 'number',
      default: 0.99,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.MOMENTUM',
      validation: {
        min: 0,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'solver',
      realName: 'solver',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER',
      type: 'select',
      default: 'adam',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.SOLVER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADAGRAD',
            value: 'adagrad'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADAM',
            value: 'adam'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.SGD',
            value: 'sgd'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.ADADELTA',
            value: 'adadelta'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SOLVER-OPTIONS.RMSPROP',
            value: 'rmsprop'
          }
        ]
      }
    },
    {
      name: 'numberOfSamples',
      realName: 'num_samples',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-SAMPLES',
      type: 'number',
      default: 10,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-SAMPLES',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'reduceOnPlateau',
      realName: 'reduce_on_plateau',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU',
      type: 'select',
      default: 'False',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.REDUCE-ON-PLATEAU',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.REDUCE-ON-PLATEAU-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'topicPriorMean',
      realName: 'topic_prior_mean',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.TOPIC-PRIOR-MEAN',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.TOPIC-PRIOR-MEAN',
      validation: {
        step: 0.1
      }
    },
    {
      name: 'topicPriorVariance',
      realName: 'topic_prior_variance',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.TOPIC-PRIOR-VARIANCE',
      type: 'number',
      default: null,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.TOPIC-PRIOR-VARIANCE',
      validation: {
        step: 0.1
      }
    },
    {
      name: 'numberOfDataLoaderWorkers',
      realName: 'num_data_loader_workers',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-DALA-LOADER-WORKERS',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-DALA-LOADER-WORKERS',
      validation: {
        min: 0,
        max: 128,
        step: 1
      }
    },
    {
      name: 'labelSize',
      realName: 'label_size',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LABEL-SIZE',
      type: 'number',
      default: 0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LABEL-SIZE',
      validation: {
        min: 0,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'lossWeights',
      realName: 'loss_weights',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.LOSS-WEIGHTS',
      type: 'string',
      default: null,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.LOSS-WEIGHTS',
      validation: {}
    },
    {
      name: 'sbertModel',
      realName: 'sbert_model_to_load',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SBERT-MODEL',
      type: 'string',
      default: 'paraphrase-distilroberta-base-v1',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.SBERT-MODEL',
      validation: {}
    }
  ];
}

export function sparkLDAParams(advanced: boolean): ModelParam[] {
  if (!advanced) return [
    {
      name: 'numberOfTopics',
      realName: 'ntopics',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.NUMBER-OF-TOPICS',
      type: 'number',
      default: 25,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.NUMBER-OF-TOPICS-SPARK',
      validation: {
        min: 1,
        max: 1000,
        step: 1
      }
    },
    {
      name: 'alpha',
      realName: 'alpha',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.ALPHA',
      type: 'number',
      default: 5.0,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.ALPHA-SPARK',
      validation: {
        min: 1.0,
        max: 1000.0,
        step: 0.1
      }
    },
    {
      name: 'maxIterations',
      realName: 'maxIterations',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.MAX-ITERATIONS',
      type: 'number',
      default: 20,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.MAX-ITERATIONS',
      validation: {
        min: 1,
        max: 10000,
        step: 1
      }
    },
    {
      name: 'optimizer',
      realName: 'optimizer',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZER',
      type: 'select',
      default: 'online',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.OPTIMIZER',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZER-OPTIONS.EM',
            value: 'online'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZER-OPTIONS.ONLINE',
            value: 'em'
          }
        ]
      }
    },
    {
      name: 'optimizeDocConcentration',
      realName: 'optimizeDocConcentration',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZE-DOC-CONCENTRATION',
      type: 'select',
      default: 'True',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.OPTIMIZE-DOC-CONCENTRATION',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZE-DOC-CONCENTRATION-OPTIONS.YES',
            value: 'True'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.OPTIMIZE-DOC-CONCENTRATION-OPTIONS.NO',
            value: 'False'
          }
        ]
      }
    },
    {
      name: 'subsamplingRate',
      realName: 'subsamplingRate',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.SUBSAMPLING-RATE',
      type: 'number',
      default: 0.05,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.SUBSAMPLING-RATE',
      validation: {
        min: 0.01,
        max: 1,
        step: 0.01
      }
    }
  ];
  else return [
    {
      name: 'thetasThreshold',
      realName: 'thetas_thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS.THETAS-THRESHOLD',
      type: 'number',
      default: 0.003,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.THETAS-THRESHOLD',
      validation: {
        min: 0.001,
        max: 1,
        step: 0.001
      }
    },
  ];
}

export function preprocessingParams(): ModelParam[] {
  return [
    {
      name: 'minLemmas',
      realName: 'minLemmas',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.MIN-LEMMAS',
      type: 'number',
      default: 15,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.MIN-LEMMAS',
      validation: {
        min: 1,
        max: null,
        step: 1
      }
    },
    {
      name: 'noBelow',
      realName: 'noBelow',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.NO-BELOW',
      type: 'number',
      default: 10,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.NO-BELOW',
      validation: {
        min: 1,
        max: null,
        step: 1
      }
    },
    {
      name: 'noAbove',
      realName: 'noAbove',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.NO-ABOVE',
      type: 'number',
      default: 0.6,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.NO-ABOVE',
      validation: {
        min: 0.01,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'keepN',
      realName: 'keepN',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.KEEP-N',
      type: 'number',
      default: 100000,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.KEEP-N',
      validation: {
        min: 1,
        max: null,
        step: 1
      }
    }
  ];
}

export function preprocessingWordlistsParams(stopwords: string[], equivalences: string[]): ModelParam[] {
  return [
    {
      name: 'stopwords',
      realName: 'stopwords',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.STOPWORDS',
      placeholder: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.STOPWORDS-PLACEHOLDER',
      type: 'rawmultiselect',
      default: [],
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.STOPWORDS',
      validation: {
        rawOptions: stopwords
      }
    },
    {
      name: 'equivalences',
      realName: 'equivalences',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.EQUIVALENCES',
      placeholder: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS.EQUIVALENCES-PLACEHOLDER',
      type: 'rawmultiselect',
      default: [],
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.PREPROCESSING-PARAMETERS-TOOLTIPS.EQUIVALENCES',
      validation: {
        rawOptions: equivalences
      }
    },
  ];
}

export function hierarchicalParams(): ModelParam[] {
  return [
    {
      name: 'thr',
      realName: 'thr',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS.THR',
      type: 'number',
      default: 0.2,
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.THR',
      validation: {
        min: 0.01,
        max: 1,
        step: 0.01
      }
    },
    {
      name: 'htm',
      realName: 'htm',
      displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS.HTM',
      type: 'select',
      default: 'htm-ds',
      tooltip: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS-TOOLTIPS.HTM',
      validation: {
        options: [
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS.HTM-OPTIONS.WS',
            value: 'htm-ws'
          },
          {
            displayName: 'APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.NEW-HIERARCHICAL-TOPIC-MODEL-DIALOG.PARAMETERS.HTM-OPTIONS.DS',
            value: 'htm-ds'
          }
        ]
      }
    },
  ]
}

export function determineValidation(trainer: TopicModelTrainer, key: string): ValidatorFn[] {
  let validators: ValidatorFn[] = [];
  const params: ModelParam[] = extractAllTopicModelParametersByTrainer(trainer);
  const paramIndex = getParamIndex(params, key);
  if (paramIndex != -1) {
    const param = params[paramIndex];
    if (param.default != null) validators.push(Validators.required);
    if (param.validation.max) validators.push(Validators.max(Number(param.validation.max)));
    if (param.validation.min) validators.push(Validators.min(Number(param.validation.min)));
  }

  return validators;
}

export function determinePreprocessingValidation(key: string): ValidatorFn[] {
  let validators: ValidatorFn[] = [];
  const params: ModelParam[] = preprocessingParams();
  const paramIndex = getParamIndex(params, key);
  if (paramIndex != -1) {
    const param = params[paramIndex];
    if (param.default != null) validators.push(Validators.required);
    if (param.validation.max) validators.push(Validators.max(Number(param.validation.max)));
    if (param.validation.min) validators.push(Validators.min(Number(param.validation.min)));
  }

  return validators;
}

function getParamIndex(params: ModelParam[], key: string): number {
  for (const [i, param] of params.entries()) {
    if (param.name === key) return i;
  }
  return -1;
}

export function extractAllTopicModelParameters(): ModelParam[] {
  let params = [];

  params.push(...malletParams(false));
  params.push(...malletParams(true));
  params.push(...prodLDAParams(false));
  params.push(...prodLDAParams(true));
  params.push(...CTMParams(false));
  params.push(...CTMParams(true));
  params.push(...sparkLDAParams(false));
  params.push(...sparkLDAParams(true));

  return params;
}

export function extractAllTopicModelParametersByTrainer(trainer: TopicModelTrainer): ModelParam[] {
  let params = [];

  if (trainer === "mallet") {
    params.push(...malletParams(false));
    params.push(...malletParams(true));
  } else if (trainer === "prodLDA") {
    params.push(...prodLDAParams(false));
    params.push(...prodLDAParams(true));
  } else if (trainer === "ctm") {
    params.push(...CTMParams(false));
    params.push(...CTMParams(true));
  } else if (trainer === "sparkLDA") {
    params.push(...sparkLDAParams(false));
    params.push(...sparkLDAParams(true));
  } else if (trainer === "all") {
    return extractAllTopicModelParameters();
  }

  return params;
}

export type TopicModelTrainer = "mallet" | "prodLDA" | "ctm" | "sparkLDA" | "all";