import { Injectable } from '@angular/core';
import { Lookup } from '@common/model/lookup';
import { nameof } from 'ts-simple-nameof';

@Injectable()
export class QueryParamsService {

	constructor() { }


	serializeLookup(lookup: Lookup): string {
		return JSON.stringify(lookup, (key: string, value: any) => {
			switch (key) {
				// 	case nameof<Lookup>(x => x.page):
				// 	case nameof<Lookup>(x => x.order):
				case nameof<Lookup>(x => x.metadata):
				case nameof<Lookup>(x => x.project):
					return undefined;
				default:
					return value == null ? undefined : value;
			}
		});
	}

	deSerializeLookup(serializedLookup: string): any {
		const json = JSON.parse(serializedLookup);
		// delete json[nameof<Lookup>(x => x.page)];
		// delete json[nameof<Lookup>(x => x.order)];
		delete json[nameof<Lookup>(x => x.metadata)];
		delete json[nameof<Lookup>(x => x.project)];
		return json;
	}

	deSerializeAndApplyLookup(serializedLookup: string, targetLookup: Lookup) {
		this.applyLookup(targetLookup, this.deSerializeLookup(serializedLookup));
	}

	private applyLookup(target: Lookup, source: Lookup) {
		Object.keys(source).forEach(key => {
			target[key] = source[key];
		});
	}

	serializeObject<T = any>(object: T): string{
		return JSON.stringify(object);
	}

	deserializeObject<T = any>(serializedObject: string): T{
		return JSON.parse(serializedObject) as T;
	}
}
