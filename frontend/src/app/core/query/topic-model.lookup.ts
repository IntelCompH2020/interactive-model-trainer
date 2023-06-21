import { IsActive } from '@app/core/enum/is-active.enum';
import { Lookup } from '@common/model/lookup';
import { Guid } from '@common/types/guid';
import { ModelVisibility } from '../enum/model-visibility.enum';

export class TopicModelLookup extends Lookup implements TopicModelFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];

	constructor() {
		super();
	}
	visibilities: ModelVisibility[];
	hierarchyLevel: number;
}

export interface TopicModelFilter {
	ids: Guid[];
	excludedIds: Guid[];
	like: string;
	isActive: IsActive[];
	visibilities: ModelVisibility[];
	hierarchyLevel: number;
}