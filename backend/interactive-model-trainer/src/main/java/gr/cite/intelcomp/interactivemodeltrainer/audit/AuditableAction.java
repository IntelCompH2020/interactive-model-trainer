package gr.cite.intelcomp.interactivemodeltrainer.audit;

import gr.cite.tools.logging.EventId;

public class AuditableAction {
	public static final EventId IdentityTracking_Action = new EventId(1000, "IdentityTracking_Action");
	public static final EventId IdentityTracking_User_Persist = new EventId(1001, "IdentityTracking_User_Persist");
	public static final EventId IdentityTracking_ForgetMe_Request = new EventId(1002, "IdentityTracking_ForgetMe_Request");
	public static final EventId IdentityTracking_ForgetMe_Validate = new EventId(1003, "IdentityTracking_ForgetMe_Validate");
	public static final EventId IdentityTracking_ForgetMe_Stamp = new EventId(1004, "IdentityTracking_ForgetMe_Stamp");
	public static final EventId Principal_Lookup = new EventId(2000, "Principal_Lookup");

	public static final EventId User_Query = new EventId(3000, "User_Query");
	public static final EventId User_Lookup = new EventId(3001, "User_Lookup");
	public static final EventId User_Persist = new EventId(3002, "User_Persist");
	public static final EventId User_Delete = new EventId(3003, "User_Delete");

	public static final EventId Scheduled_Event_Persist = new EventId(4000, "Scheduled_Event_Persist");
	public static final EventId Scheduled_Event_Canceled = new EventId(4001, "Scheduled_Event_Canceled");
	public static final EventId Scheduled_Event_Run = new EventId(4002, "Scheduled_Event_Run");
}
