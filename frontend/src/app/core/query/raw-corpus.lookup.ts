import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class RawCorpusLookup extends Lookup implements RawCorpusFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];
	corpusType: String = "RAW";

	creator: string;
	mine: boolean;

	constructor() {
		super();
	}
}

export interface RawCorpusFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];
	corpusType: String;
}