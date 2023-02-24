import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseService } from '@common/base/base.service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { UserProfileLanguagePatch } from '@user-service/core/model/user.model';
import { UserService } from '@user-service/services/http/user.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class LanguageService extends BaseService {

	private languageValues: Map<LanguageType, string>;
	private languageChangeSubject = new BehaviorSubject<LanguageType>(LanguageType.English);
	private currentLanguage = LanguageType.English;

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService
	) {
		super();

		this.languageValues = new Map<LanguageType, string>();
		this.languageValues
			.set(LanguageType.English, 'en')
			.set(LanguageType.Greek, 'el');
	}

	getLanguageValues(): string[] {
		const values: string[] = [];
		this.languageValues.forEach((value) => values.push(value));
		return values;
	}

	getLanguageKey(language: string): LanguageType | undefined {
		for (const [key, value] of Array.from(this.languageValues)) {
			if (language === value) { return key; }
		}
		return;
	}

	getLanguageValue(language: LanguageType): string | undefined {
		return this.languageValues.get(language);
	}

	languageSelected(language: LanguageType, updateUserProfile = true) {
		if (this.currentLanguage === language) { return; }

		const userId = this.authService.userId();
		if (updateUserProfile && userId) {
			const userLanguage: UserProfileLanguagePatch = {
				id: userId,
				language: this.languageValues.get(language)
			};

			this.userService.updateUserLanguage(userLanguage).pipe(takeUntil(this._destroyed)).subscribe(
				complete => {
					this.currentLanguage = language;
					this.languageChangeSubject.next(language);
				},
				error => this.onCallbackError(error)
			);
		} else {
			this.currentLanguage = language;
			this.languageChangeSubject.next(language);
		}

	}

	getLanguageChangeObservable(): Observable<LanguageType> {
		return this.languageChangeSubject.asObservable();
	}

	getCurrentLanguage(): LanguageType {
		return this.currentLanguage;
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}
}
