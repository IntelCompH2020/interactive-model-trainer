import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { IsActive } from '@app/core/enum/is-active.enum';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { AppPermission } from '@app/core/enum/permission.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseEditor } from '@common/base/base-editor';
import { FormService } from '@common/forms/form-service';
import { InstallationConfigurationService } from '@common/installation-configuration/installation-configuration.service';
import { LoggingService } from '@common/logging/logging-service';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { ContactInfoType } from '@notification-service/core/enum/contact-info-type.enum';
import { UserServiceUser } from '@user-service/core/model/user.model';
import { CultureInfo, CultureService } from '@user-service/services/culture.service';
import { UserService } from '@user-service/services/http/user.service';
import { LanguageService } from '@user-service/services/language.service';
import { TimezoneService } from '@user-service/services/timezone.service';
import { UserEditorModel } from '@user-service/ui/users/editor/user-editor.model';
import { UserEditorResolver } from '@user-service/ui/users/editor/user-editor.resolver';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-user-editor',
	templateUrl: './user-editor.component.html',
	styleUrls: ['./user-editor.component.scss']
})

export class UserEditorComponent extends BaseEditor<UserEditorModel, UserServiceUser> implements OnInit {

	isNew = true;
	isDeleted = false;
	canEdit = false;
	canDelete = false;

	contactInfoTypeEnum = ContactInfoType;
	cultureValues = new Array<CultureInfo>();
	timezoneValues = new Array<string>();
	languageTypeValues: Array<LanguageType>;
	filteredCultures = new Array<CultureInfo>();
	filteredTimezones = new Array<string>();




	formGroup: FormGroup = null;

	constructor(
		public authService: AuthService,
		public languageService: LanguageService,
		public appEnumUtils: AppEnumUtils,
		protected dialog: MatDialog,
		protected userService: UserService,
		protected route: ActivatedRoute,
		protected router: Router,
		protected language: TranslateService,
		protected formService: FormService,
		protected cultureService: CultureService,
		protected timezoneService: TimezoneService,
		protected uiNotificationService: UiNotificationService,
		protected logger: LoggingService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected installationConfiguration: InstallationConfigurationService,
		protected filterService: FilterService,
		protected datePipe: DatePipe,
		protected queryParamsService: QueryParamsService
	) {
		super(dialog, language, formService, router, uiNotificationService, httpErrorHandlingService, filterService, datePipe, route, queryParamsService);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this.cultureValues = this.cultureService.getCultureValues();
		this.timezoneValues = this.timezoneService.getTimezoneValues();
		this.languageTypeValues = this.appEnumUtils.getEnumValues(LanguageType);
	}
	formSubmit(): void { //* DONE CHECK
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { return; }

		this.persistEntity();

	}
	persistEntity(onSuccess?: (response: any) => void): void { // * DONE

		const formData = this.formService.getValue(this.formGroup);
		this.userService.persist(formData)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				complete => this.onCallbackSuccess(),
				error => this.onCallbackError(error)
			);
	}
	delete(): void { //* DONE 
		const value = this.formGroup.value;
		if (value.id) {
			const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
				maxWidth: '300px',
				restoreFocus: false,
				data: {
					message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
					confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
					cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
				}
			});
			dialogRef.afterClosed()
				.pipe(takeUntil(this._destroyed))
				.subscribe(result => {
					if (result) {
						this.userService.delete(value.id).pipe(takeUntil(this._destroyed))
							.subscribe(
								complete => this.onCallbackSuccess(),
								error => this.onCallbackError(error)
							);
					}
				});
		}
	}

	buildForm(): void { //* DONE
		this.formGroup = this.editorModel.buildForm(this.installationConfiguration, this.languageService, null, this.isDeleted || !this.canEdit);

		this.filteredCultures = this.isNew ?
			this.cultureValues :
			this.cultureValues.filter((culture) => culture.name === this.editorModel.profile.culture);
		this.filteredTimezones = this.isNew ?
			this.timezoneValues :
			this.timezoneValues.filter((zone) => zone === this.editorModel.profile.timezone);

		// set change listeners
		this.formGroup.get('profile.timezone').valueChanges
			.pipe(takeUntil(this._destroyed))
			.subscribe((text) => {
				const searchText = text.toLowerCase();
				const result = this.timezoneValues.filter((zone) => zone.toLowerCase().indexOf(searchText) >= 0);
				this.filteredTimezones = result;
			});

		this.formGroup.get('profile.culture').valueChanges
			.pipe(takeUntil(this._destroyed))
			.subscribe((text) => {
				const searchText = text.toLowerCase();
				const result = this.cultureValues.filter((culture) =>
					culture.name.toLowerCase().indexOf(searchText) >= 0 ||
					culture.nativeName.toLowerCase().indexOf(searchText) >= 0 ||
					culture.displayName.toLowerCase().indexOf(searchText) >= 0
				);
				this.filteredCultures = result;
			});
	}
	getItem(itemId: Guid, successFunction: (item: UserServiceUser) => void): void { //*DONE
		this.userService.getSingle(itemId, [
			...UserEditorResolver.lookupFields()
		]).pipe(takeUntil(this._destroyed))
			.subscribe(
				data => successFunction(data),
				error => this.onCallbackError(error)
			);
	}
	prepareForm(data: UserServiceUser): void { //* DONE NEEDS REVISITING
		try {
			const userObject = data;
			this.editorModel = new UserEditorModel().fromModel(userObject);
			this.isDeleted = data.isActive === IsActive.Inactive;
			this.canEdit = this.authService.hasPermission(AppPermission.EditUser);
			this.canDelete = this.authService.hasPermission(AppPermission.DeleteUser);
			this.buildForm();
			return;
		} catch (e) {
			this.logger.error('Could not parse User: ' + data);
			this.uiNotificationService.snackBarNotification(this.language.instant('COMMONS.ERRORS.DEFAULT'), SnackBarNotificationLevel.Error);
		}
	}

	onCallbackSuccess(): void {
		this.uiNotificationService.snackBarNotification(this.isNew ? this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-CREATION') : this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.router.navigate(['/users']);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400 && error['errorCode'] === 128) {
			this.editorModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	getHtmlElementContactInfoTypeName(contactInfoType: ContactInfoType): string {
		switch (contactInfoType) {
			case ContactInfoType.Email: return 'email';
			case ContactInfoType.MobilePhone: return 'mobilePhone';
			case ContactInfoType.LandLinePhone: return 'landLinePhone';
		}
	}

	getHtmlElementContactInfoTypePlaceholder(contactInfoType: ContactInfoType): string {
		switch (contactInfoType) {
			case ContactInfoType.Email: return this.language.instant('USER-SERVICE.USER-EDITOR.FIELDS.EMAIL');
			case ContactInfoType.MobilePhone: return this.language.instant('USER-SERVICE.USER-EDITOR.FIELDS.MOBILE-PHONE');
			case ContactInfoType.LandLinePhone: return this.language.instant('USER-SERVICE.USER-EDITOR.FIELDS.LANDLINE-PHONE');
		}
	}
	//* OUR implementation
	refreshData(): void {
		this.getItem(this.editorModel.id, (data: UserServiceUser) => this.prepareForm(data));
	}
	refreshOnNavigateToData(id?: Guid): void { // * !!Revisiion !!!!
		if (this.isNew) {
			this.formGroup.markAsPristine();
			this.router.navigate(['/users/' + (id ? id : this.editorModel.id)], { queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });
		} else { this.internalRefreshData(); }
	}

}
