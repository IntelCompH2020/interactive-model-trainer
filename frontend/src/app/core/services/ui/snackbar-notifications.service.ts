import { Injectable } from '@angular/core';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SnackBarCommonNotificationsService {

  constructor(
    protected uiNotificationService: UiNotificationService,
    protected language: TranslateService
  ) { }

  successfulCreation(): void {
    this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.SUCCESSFUL-CREATION"), SnackBarNotificationLevel.Success);
  }

  successfulUpdate(): void {
    this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE"), SnackBarNotificationLevel.Success);
  }

  successfulDeletion(): void {
    this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.SUCCESSFUL-DELETION"), SnackBarNotificationLevel.Success);
  }

  operationStarted(): void {
    this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.OPERATION-STARTED"), SnackBarNotificationLevel.Info);
  }

  successfulOperation(refreshed: boolean = false): void {
    if (refreshed) this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.SUCCESSFUL-OPERATION-REFRESH-PAGE"), SnackBarNotificationLevel.Success);
    else this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.SUCCESSFUL-OPERATION"), SnackBarNotificationLevel.Success);
  }

  notSuccessfulOperation(): void {
    this.uiNotificationService.snackBarNotification(this.language.instant("APP.COMMONS.SNACK-BAR.UNSUCCESSFUL-OPERATION"), SnackBarNotificationLevel.Error);
  }

}