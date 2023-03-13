import { DomainModelSubType, DomainModelType } from '@app/core/enum/domain-model-type.enum';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';
import { Guid } from '@common/types/guid';


export interface DomainModel extends BaseEntity {
  name: string;
  description: string;
  type: DomainModelType;
  subtype: DomainModelSubType;
  visibility?: ModelVisibility;
  creator: string;
  creation_date: Date;
  location: string;
  numberOfHeads?:number;
  depth?: number;
  tag?: string;
  corpus: Guid;
}
export interface DomainModelPersist extends BaseEntityPersist {
  name: string;
  type: DomainModelType;
  subtype: DomainModelSubType;
  location: string;
  visibility?: ModelVisibility;
  numberOfHeads?:number;
  depth?: number;
  tag?: string;
  corpus: Guid;
}