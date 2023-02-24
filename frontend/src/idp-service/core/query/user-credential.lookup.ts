import { Lookup } from '@common/model/lookup';
import { CredentialProvider } from '@idp-service/core/enum/credential-provider.enum';
import { UserLookup } from '@idp-service/core/query/user.lookup';

export class UserCredentialLookup extends Lookup implements UserCredentialFilter {
	provider: CredentialProvider[];
	userSubQuery: UserLookup[];

	constructor() {
		super();
	}
}

export interface UserCredentialFilter {
	provider: CredentialProvider[];
	userSubQuery: UserLookup[];
}
