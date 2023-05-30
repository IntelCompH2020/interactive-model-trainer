export interface QueryResult<T> {
	count: number;
	countOverride?: number;
	items: T[];
}
