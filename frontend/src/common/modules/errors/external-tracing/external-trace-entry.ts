export interface ExternalTraceEntry {
	eventId: EventId;
	level: ExternalTraceLogLevel;
	message: string;
	data: any;
}

export interface EventId {
	id: number;
}

export enum ExternalTraceLogLevel {
	Trace = 0,
	Debug = 1,
	Information = 2,
	Warning = 3,
	Error = 4,
	Critical = 5,
	None = 6
}
