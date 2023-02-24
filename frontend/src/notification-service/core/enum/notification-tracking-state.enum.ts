export enum NotificationTrackingState {
	/// <summary>
	/// Initial state
	/// </summary>
	Undefined = 0,
	/// <summary>
	/// Final for notifiers that do not provide any kind of tracking
	/// </summary>
	NA = 1,
	Queued = 2,
	Sent = 3,
	Delivered = 4,
	Undelivered = 5,
	Failed = 6,
	Unsent = 7
}
