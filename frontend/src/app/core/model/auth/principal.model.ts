import { AppPermission } from '@app/core/enum/permission.enum';
import { Guid } from '@common/types/guid';

export interface AppAccount {
	isAuthenticated: boolean;
	permissions: AppPermission[];
	principal: PrincipalInfo;
}

export interface PrincipalInfo {
	subject: Guid;
	userId: Guid;
	name: string;
	scope: string;
	client: string;
	notBefore: string;
	issuedAt: string;
	authenticatedAt: string;
	expiresAt: string;
	more: Map<string, Array<string>>;
}

