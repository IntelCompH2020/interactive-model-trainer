import { Injectable } from '@angular/core';

@Injectable()
export class ModelSelectionService {

  private _corpus: String = "";
  private _model: String = "";

  get corpus(): Readonly<String> {
    return this._corpus;
  }
  get model(): Readonly<String> {
    return this._model;
  }

  set corpus(corpus: String) {
    this._corpus = corpus;
  }
  set model(model: String) {
    this._model = model;
  }

  constructor() {

  }

}