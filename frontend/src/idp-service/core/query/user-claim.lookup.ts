import { Lookup } from '@common/model/lookup';
import { UserLookup } from '@idp-service/core/query/user.lookup';

export class UserClaimLookup extends Lookup implements UserClaimFilter {
	claim: string;
	values: string[];
	userSubQuery: UserLookup[];

	constructor() {
		super();
	}
}

export interface UserClaimFilter {
	claim: string;
	values: string[];
	userSubQuery: UserLookup[];
}
