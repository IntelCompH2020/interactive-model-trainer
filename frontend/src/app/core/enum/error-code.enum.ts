export enum ResponseErrorCode{
    HashConflict = 100,
    Forbidden = 101,
    SystemError =102,
    MissingTenant = 103,
    StaleAPIKey = 104,
    InvalidApiKey = 105,
    ModelValidation = 106,
    BlockingConsent = 107,
    SensitiveInfo = 108,
    NonPersonPrincipal = 109,
    WhatYouKnowAboutMeIncompatibleState = 110,
    TokenConsumed = 112,
}