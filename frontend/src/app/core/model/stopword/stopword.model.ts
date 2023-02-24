import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Moment } from 'moment';


export interface Stopword extends BaseEntity {
  name: string;
  description: string;
  visibility: WordListVisibility;
  wordlist: string[];
  creation_date: Moment;
  location?: string;
  creator?: string;
}

export interface StopwordPersist extends BaseEntityPersist {
  name: string;
  description: string;
  visibility: WordListVisibility;
  wordlist: string[];
  creation_date: Moment;
  location?: string;
  creator?: string;
}