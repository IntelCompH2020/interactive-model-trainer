import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { IsActive } from '@idp-service/core/enum/is-active.enum';
import { UserType } from '@idp-service/core/enum/user-type.enum';
import { UserClaimLookup } from '@idp-service/core/query/user-claim.lookup';
import { UserCredentialLookup } from '@idp-service/core/query/user-credential.lookup';

export class UserLookup extends Lookup implements UserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	type: UserType[];
	like: string;
	isActive: IsActive[];
	userCredentialSubQuery: UserCredentialLookup;
	userClaimSubQuery: UserClaimLookup

	constructor() {
		super();
	}
}

export interface UserFilter {
	ids: Guid[];
	excludedIds: Guid[];
	type: UserType[];
	like: string;
	isActive: IsActive[];
	userCredentialSubQuery: UserCredentialLookup;
	userClaimSubQuery: UserClaimLookup
}
