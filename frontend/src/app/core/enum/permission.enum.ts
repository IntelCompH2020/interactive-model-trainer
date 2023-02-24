export enum AppPermission {
	DeferredAffiliation = 'DeferredAffiliation',
	//DataAccessRequest
	BrowseDataAccessRequest = 'BrowseDataAccessRequest',
	EditDataAccessRequest = 'EditDataAccessRequest',
	CreateDataAccessRequest = 'CreateDataAccessRequest',
	ApproveDataAccessRequest = 'ApproveDataAccessRequest',
	RejectDataAccessRequest = 'RejectDataAccessRequest',
	DeleteDataAccessRequest = 'DeleteDataAccessRequest',

	//Indicator
	BrowseIndicator = 'BrowseIndicator',
	EditIndicator = 'EditIndicator',
	DeleteIndicator = 'DeleteIndicator',

	//User
	BrowseUser = 'BrowseUser',
	EditUser = 'EditUser',
	DeleteUser = 'DeleteUser',

	//UserContactInfo
	BrowseUserContactInfo = 'BrowseUserContactInfo',
	EditUserContactInfo = 'EditUserContactInfo',
	DeleteUserContactInfo = 'DeleteUserContactInfo',

	//UserInvitation
	BrowseUserInvitation = 'BrowseUserInvitation',
	EditUserInvitation = 'EditUserInvitation',
	DeleteUserInvitation = 'DeleteUserInvitation',

	//User
	BrowseUserSettings = 'BrowseUserSettings',
	EditUserSettings = 'EditUserSettings',
	DeleteUserSettings = 'DeleteUserSettings',

	//Tenant
	BrowseTenant = 'BrowseTenant',
	EditTenant = 'EditTenant',
	DeleteTenant = 'DeleteTenant',
	AllowNoTenant = 'AllowNoTenant',

	//TenantUser
	BrowseTenantUser = 'BrowseTenantUser',
	EditTenantUser = 'EditTenantUser',
	DeleteTenantUser = 'DeleteTenantUser',
	//Tenant Request
	BrowseTenantRequest = 'BrowseTenantRequest',
	EditTenantRequest = 'EditTenantRequest',
	CreateTenantRequest = 'CreateTenantRequest',
	DeleteTenantRequest = 'DeleteTenantRequest',
	ApproveTenantRequest = 'ApproveTenantRequest',
	RejectTenantRequest = 'RejectTenantRequest',

	//Dataset
	BrowseDataset = 'BrowseDataset',
	EditDataset = 'EditDataset',
	DeleteDataset = 'DeleteDataset',
	//DetailItem
	BrowseDetailItem = 'BrowseDetailItem',
	EditDetailItem = 'EditDetailItem',
	DeleteDetailItem = 'DeleteDetailItem',
	//MasterItem
	BrowseMasterItem = 'BrowseMasterItem',
	EditMasterItem = 'EditMasterItem',
	DeleteMasterItem = 'DeleteMasterItem',

	//Blueprint Request
	BrowseBlueprintRequest = 'BrowseBlueprintRequest',
	CreateBlueprintRequest = 'CreateBlueprintRequest',
	UpdateBlueprintRequest = 'UpdateBlueprintRequest',
	DeleteBlueprintRequest = 'DeleteBlueprintRequest',

	//Create Blueprint
	CreateBlueprint = 'CreateBlueprint',

	// UI Pages
	ViewDatasetPage = 'ViewDatasetPage',
	ViewIndicatorPage = 'ViewIndicatorPage',
	ViewIndicatorReportsPage = 'ViewIndicatorReportsPage',
	ViewIndicatorReportsDashboardPage = 'ViewIndicatorReportsDashboardPage',
	ViewDataAccessRequestPage = 'ViewDataAccessRequestPage',
	ViewTenantPage = 'ViewTenantPage',
	ViewTenantRequestPage = 'ViewTenantRequestPage',
	ViewUsersPage = 'ViewUsersPage',
	ViewApiClientsPage = 'ViewApiClientsPage',
	ViewRoleAssignmentPage = 'ViewRoleAssignmentPage',
	ViewAccessTokensPage = 'ViewAccessTokensPage',
	ViewUserInvitationPage = 'ViewUserInvitationPage',
	ViewUserProfilePage = 'ViewUserProfilePage',
	ViewForgetMeRequestPage = 'ViewForgetMeRequestPage',
	ViewWhatYouKnowAboutMeRequestPage = 'ViewWhatYouKnowAboutMeRequestPage',
	ViewMasterItemPage = 'ViewMasterItemPage',
	ViewTenantConfigurationPage = 'ViewTenantConfigurationPage',
	ViewNotificationPage = 'ViewNotificationPage',
	ViewNotificationEventRulePage = 'ViewNotificationEventRulePage',
	ViewInAppNotificationPage = 'ViewInAppNotificationPage',
	ViewNotificationTemplatePage = 'ViewNotificationTemplatePage',
	ViewBlueprintRequestPage = 'ViewBlueprintRequestPage',
	DownloadReport = 'DownloadReport',
	ViewBlueprintTemplatePage = 'ViewBlueprintTemplatePage',
}

