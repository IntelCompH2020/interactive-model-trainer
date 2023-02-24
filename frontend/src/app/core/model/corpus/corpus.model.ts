import { CorpusVisibility } from "@app/core/enum/corpus-visibility.enum";
import { Guid } from "@common/types/guid";

export interface Corpus {
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