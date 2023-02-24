import { Lookup } from '@common/model/lookup';

export interface PersistedGrantFilter {
	like: string;
}

export class PersistedGrantLookup extends Lookup implements PersistedGrantFilter {
	like: string;

	constructor() {
		super();
	}
}
