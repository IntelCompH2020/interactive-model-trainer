import { Injectable } from '@angular/core';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';

@Injectable()
export class ModelSelectionService {

  private _corpus: LogicalCorpus = undefined;
  private _model: String = "";

  get corpus(): Readonly<LogicalCorpus> {
    return this._corpus;
  }
  get model(): Readonly<String> {
    return this._model;
  }

  set corpus(corpus: LogicalCorpus) {
    this._corpus = corpus;
  }
  set model(model: String) {
    this._model = model;
  }

  constructor() {

  }

}