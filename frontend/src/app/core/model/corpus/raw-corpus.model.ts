import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { Corpus, CorpusPersist } from './corpus.model';


export interface RawCorpus extends Corpus {
  download_date: Date;
  records: number;
  source: string;
  schema: string[]; 
}


export interface RawCorpusPersist extends CorpusPersist{
  download_date: Date;
  records: number;
  source: string;
  schema: RawCorpusFieldPersist[] | string[]; 
}


export interface RawCorpusField  {
  name: string;
  type: string;
  selected: boolean;
}

export interface RawCorpusFieldPersist {
  name: string;
  type: string;
  selected: boolean;
}