import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { BaseEntity, BaseEntityPersist } from '@common/base/base-entity.model';

export interface DomainModel extends BaseEntity {
  name: string;
  description: string;
  visibility?: ModelVisibility;
  creator: string;
  location: string;
  creation_date: Date;
  tag?: string;
  TrDtSet: string;
}

export interface DomainModelPersist extends BaseEntityPersist {
  name: string;
  description: string;
  visibility?: ModelVisibility;
  tag?: string;
  TrDtSet: string;
}

export interface Document {
  id: string;
  title: string;
  text: string;
  label: string | number;
}