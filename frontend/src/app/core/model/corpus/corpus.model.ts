import { CorpusVisibility } from "@app/core/enum/corpus-visibility.enum";
import { BaseEntity } from "@common/base/base-entity.model";
import { Guid } from "@common/types/guid";

export interface Corpus extends BaseEntity {
  id: Guid;
  name: string;
  description: string;
  visibility: CorpusVisibility;
}

export interface CorpusPersist {
  id: Guid;
  name: string;
  description: string;
  visibility: CorpusVisibility;
}