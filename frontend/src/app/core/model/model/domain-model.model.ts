import { DomainModelSubType, DomainModelType } from '@app/core/enum/domain-model-type.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';
import { RawCorpus } from '../corpus/raw-corpus.model';


export interface DomainModel extends BaseEntity {
  name: string;
  type: DomainModelType;
  subtype: DomainModelSubType;
  creator: string;
  creation_date: Date;
  location: string;
  private?: boolean;
  numberOfHeads?:number;
  depth?: number;
  tag?: string;
  corpus: RawCorpus;
}
export interface DomainModelPersist extends BaseEntityPersist {
  name: string;
  type: DomainModelType;
  subtype: DomainModelSubType;
  creator: string;
  creation_date: Date;
  location: string;
  private?: boolean;
  numberOfHeads?:number;
  depth?: number;
  tag?: string;
  corpusId: Guid;
}