import { CorpusValidFor } from '@app/core/enum/corpus-valid-for.enum';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { Guid } from '@common/types/guid';
import { Corpus, CorpusPersist } from './corpus.model';
import { RawCorpus, RawCorpusField, RawCorpusFieldPersist } from './raw-corpus.model';


export interface LogicalCorpus extends Corpus {
  name: string;
  description: string;
  visibility: CorpusVisibility;
  creator: string;
  creation_date: Date;
  Dtsets: LocalDataset[];
  valid_for?: CorpusValidFor;
}

export interface LogicalCorpusPersistHelper extends CorpusPersist {
  name: string;
  creator: string;
  creation_date: Date;
  corpora: CorpusItemPersist[];
}

export interface CorpusItem {
  corpus: RawCorpus;
  corpusSelections: RawCorpusField[];
}
export interface CorpusItemPersist {
  corpusId: Guid;
  corpusName?: string;
  corpusSelections: RawCorpusFieldPersist[];
}

export interface LogicalCorpusPersist {
  name: string;
  description: string;
  visibility: CorpusVisibility;
  valid_for: string;
  fields: LogicalCorpusField[];
  Dtsets: LocalDataset[];
}

export interface LocalDataset {
  source?: string;
  idfld?: string;
  titlefld?: string;
  textfld?: string[];
  lemmasfld?: string[];
  emmbedingsfld?: string;
  filter?: string;
}

export interface LogicalCorpusField {
  name: string;
  type: string;
  originalFields: MergedCorpusField[];
}

export interface MergedCorpusField {
  name: string;
  type: string;
  corpusName: string;
}
