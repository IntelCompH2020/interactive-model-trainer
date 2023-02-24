import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ConsentResponse } from '@idp-service/core/enum/consent-response.enum';
import { UserLookup } from '@user-service/core/query/user.lookup';

export class UserConsentLookup extends Lookup implements UserConsentFilter {
	userIds: Guid[];
	userSubQuery: UserLookup[];
	consentIds: Guid[];
	response: ConsentResponse[];

	constructor() {
		super();
	}
}

export interface UserConsentFilter {
	userIds: Guid[];
	userSubQuery: UserLookup[];
	consentIds: Guid[];
	response: ConsentResponse[];
}


