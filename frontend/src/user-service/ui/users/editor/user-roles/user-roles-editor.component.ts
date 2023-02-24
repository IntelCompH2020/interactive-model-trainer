import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
import { LoggingService } from '@common/logging/logging-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { RoleType } from '@app/core/enum/role-type.enum';
import { nameof } from 'ts-simple-nameof';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-roles-editor',
	templateUrl: './user-roles-editor.component.html',
	styleUrls: ['./user-roles-editor.component.scss']
})
export class UserRolesEditorComponent extends BaseComponent implements OnInit {

	@Input() userId: Guid;
	selectedUserRoles: RoleType[] = [];
	//existingUserClaims: UserClaim[];
	userRoleValues: RoleType[] = this.appEnumUtils.getEnumValues(RoleType);

	constructor(
		private router: Router,
		private language: TranslateService,
		public appEnumUtils: AppEnumUtils,
		private formService: FormService,
		private uiNotificationService: UiNotificationService,
		private logger: LoggingService,
		private httpErrorHandlingService: HttpErrorHandlingService,
	) { super(); }

	ngOnInit(): void {
		if (this.userId) {
			//  this.idpUserService.getSingle(this.userId, [
			//  	nameof<IdpServiceUser>(x => x.id), nameof<IdpServiceUser>(x => x.name),
			//  	nameof<IdpServiceUser>(x => x.type), nameof<IdpServiceUser>(x => x.isActive),
			//  	nameof<IdpServiceUser>(x => x.hash), nameof<IdpServiceUser>(x => x.updatedAt),
			//  	nameof<IdpServiceUser>(x => x.claims) + '.' + nameof<UserClaim>(x => x.claim),
			//  	nameof<IdpServiceUser>(x => x.claims) + '.' + nameof<UserClaim>(x => x.value),
			//  ]).pipe(takeUntil(this._destroyed))
			//  	.subscribe(
			//  		data => {
			//  			try {
			//  				this.existingUserClaims = data.claims || [];
			//  				this.selectedUserRoles = this.existingUserClaims.filter(x => x.claim === 'role').map(x => x.value as RoleType);
			//  				return;
			//  			} catch (e) {
			//  				this.logger.error('Could not parse User: ' + data);
			//  				this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
			//  			}
			//  		},
			//  		error => this.onCallbackError(error)
			//  	);
		}
	}

	saveClaims(): void {
		//  const existingUserClaimsExcludingRoles = this.existingUserClaims.filter(x => x.claim !== 'role');
		//  const claimsToPersist = existingUserClaimsExcludingRoles;
		//  claimsToPersist.push(...this.selectedUserRoles.map(x => ({ claim: 'role', value: x })));
		//  this.idpUserService.updateUserClaims(this.userId, claimsToPersist)
		//  	.pipe(takeUntil(this._destroyed))
		//  	.subscribe(
		//  		complete => this.onCallbackSuccess(),
		//  		error => this.onCallbackError(error)
		//  	);
	}

	public cancel(): void {
		this.router.navigate(['/users']);
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
