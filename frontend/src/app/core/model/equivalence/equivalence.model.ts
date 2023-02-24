import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Moment } from 'moment';

export interface Equivalence extends BaseEntity {
  name: string;
  description: string;
  visibility: WordListVisibility;
  creator: string;
  location: string;
  private?: boolean;
  term: string;
  equivalence: string;
  wordlist: EquivalenceItem[];
  creation_date: Moment;
}

export interface EquivalencePersist extends BaseEntityPersist {
  name: string;
  description: string;
  visibility: WordListVisibility;
  creator: string;
  location: string;
  term: string;
  equivalence: string;
  wordlist: EquivalenceItem[];
  creation_date: Moment;
}

export interface EquivalenceItem{
  term: string;
  equivalence: string;
}