import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';

export class LogicalCorpusLookup extends Lookup implements LogicalCorpusFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];

	corpusType: string = "LOGICAL";
	corpusValidFor: string;
	creator: string;
	mine: boolean;

	constructor() {
		super();
	}
}

export interface LogicalCorpusFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];
	corpusType: string;
	corpusValidFor: string;
}