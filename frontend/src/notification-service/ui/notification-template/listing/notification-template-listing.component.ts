import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { AuthService } from '@app/core/services/ui/auth.service';
import { BaseComponent } from '@common/base/base.component';
import { ConfirmationDialogComponent } from '@common/modules/confirmation-dialog/confirmation-dialog.component';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { Guid } from '@common/types/guid';
import { TranslateService } from '@ngx-translate/core';
import { IsActive } from '@notification-service/core/enum/is-active.enum';
import { NotificationTemplateChannel } from '@notification-service/core/enum/notification-template-channel.enum';
import { NotificationTemplateKind } from '@notification-service/core/enum/notification-template-kind.enum';
import { NotificationType } from '@notification-service/core/enum/notification-type.enum';
import { NotificationServiceEnumUtils } from '@notification-service/core/formatting/enum-utils.service';
import { NotificationTemplate } from '@notification-service/core/model/notification-template.model';
import { NotificationTemplateLookup } from '@notification-service/core/query/notification-template.lookup';
import { NotificationTemplateService } from '@notification-service/services/http/notification-template.service';
import { LanguageService } from '@user-service/services/language.service';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';

@Component({
	selector: 'app-notification-template-listing',
	templateUrl: './notification-template-listing.component.html',
	styleUrls: ['./notification-template-listing.component.scss']
})
export class NotificationTemplateListingComponent extends BaseComponent implements OnInit {

	filtersFormGroup: FormGroup;
	languageEnumValues: LanguageType[] = this.appEnumUtils.getEnumValues<LanguageType>(LanguageType);
	notificationTypesEnumValues: NotificationType[] = this.notificationEnumUtils.getEnumValues<NotificationType>(NotificationType);
	notificationChannelEnumValues: NotificationTemplateChannel[] = this.notificationEnumUtils.getEnumValues<NotificationTemplateChannel>(NotificationTemplateChannel);

	notificationTemplates: NotificationTemplate[];
	notificationTemplateKindEnum = NotificationTemplateKind;

	constructor(
		public authService: AuthService,
		private notificationTemplateService: NotificationTemplateService,
		private route: ActivatedRoute,
		private router: Router,
		public appEnumUtils: AppEnumUtils,
		public notificationEnumUtils: NotificationServiceEnumUtils,
		private uiNotificationService: UiNotificationService,
		private httpErrorHandlingService: HttpErrorHandlingService,
		private formBuilder: FormBuilder,
		private languageService: LanguageService,
		private language: TranslateService,
		private dialog: MatDialog
	) {
		super();
	}

	ngOnInit(): void {
		this.createFiltersAndRegisterEvents();

		this.route.paramMap.pipe(takeUntil(this._destroyed)).subscribe((paramMap: ParamMap) => {
			const notificationType = paramMap.get('notification-type');
			const channel = paramMap.get('channel');
			const language = paramMap.get('language');

			if (channel != null && notificationType != null && language != null) {
				this.filtersFormGroup.get('notificationType').setValue(notificationType, { emitEvent: false });
				this.filtersFormGroup.get('channel').setValue(Number.parseInt(channel), { emitEvent: false });
				this.filtersFormGroup.get('language').setValue(Number.parseInt(language), { emitEvent: false });

				this.queryTemplates(notificationType as NotificationType, Number.parseInt(channel), Number.parseInt(language));
			}
		});
	}

	createFiltersAndRegisterEvents() {
		this.filtersFormGroup = this.formBuilder.group({
			channel: [null, [Validators.required]],
			notificationType: [null, [Validators.required]],
			language: [null, [Validators.required]],
		});

		this.filtersFormGroup.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(x => {
			if (x.channel != null && x.notificationType != null && x.language != null) {
				this.router.navigate(['/notification-templates', x.notificationType, x.channel, x.language]);
			}
		});
	}

	queryTemplates(type: NotificationType, channel: NotificationTemplateChannel, language: LanguageType) {
		const lookup = new NotificationTemplateLookup();
		lookup.isActive = [IsActive.Active];
		lookup.includeDefault = true;
		lookup.notificationType = [type];
		lookup.channel = [channel];
		lookup.language = [this.languageService.getLanguageValue(language)];
		lookup.project = {
			fields: [
				nameof<NotificationTemplate>(x => x.id),
				nameof<NotificationTemplate>(x => x.hash),
				nameof<NotificationTemplate>(x => x.channel),
				nameof<NotificationTemplate>(x => x.notificationType),
				nameof<NotificationTemplate>(x => x.kind),
				nameof<NotificationTemplate>(x => x.language),
				nameof<NotificationTemplate>(x => x.description),
				nameof<NotificationTemplate>(x => x.value),
				nameof<NotificationTemplate>(x => x.isActive),
				nameof<NotificationTemplate>(x => x.createdAt),
				nameof<NotificationTemplate>(x => x.updatedAt),
				nameof<NotificationTemplate>(x => x.createdAt),
			]
		};
		this.notificationTemplateService.query(lookup)
			.pipe(takeUntil(this._destroyed))
			.subscribe(
				data => {
					this.notificationTemplates = data.items;
				},
				error => this.onCallbackError(error)
			);
	}

	refreshTemplates() {
		this.queryTemplates(this.filtersFormGroup.get('notificationType').value, this.filtersFormGroup.get('channel').value, this.filtersFormGroup.get('language').value);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
	}

	cloneItem(notificationTemplate: NotificationTemplate, event: MouseEvent) {
		event.stopPropagation();
		const itemToClone: NotificationTemplate = JSON.parse(JSON.stringify(notificationTemplate));
		itemToClone.kind = NotificationTemplateKind.Draft;
		itemToClone.id = undefined;
		itemToClone.hash = undefined;
		itemToClone.isActive = undefined;
		this.notificationTemplates.push(itemToClone);
	}

	onPersist() {
		this.refreshTemplates();
	}

	public updateKind(templateId: Guid, kind: NotificationTemplateKind, event: MouseEvent) {
		if (event) { event.stopPropagation(); }
		this.notificationTemplateService.updateKind(templateId, kind).pipe(takeUntil(this._destroyed)).subscribe(
			complete => this.refreshTemplates(),
			error => this.onCallbackError(error)
		);
	}

	public askToDelete(templateId: Guid, event: MouseEvent) {
		if (event) { event.stopPropagation(); }
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			maxWidth: '300px',
			data: {
				message: this.language.instant('COMMONS.CONFIRMATION-DIALOG.DELETE-ITEM'),
				confirmButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CONFIRM'),
				cancelButton: this.language.instant('COMMONS.CONFIRMATION-DIALOG.ACTIONS.CANCEL')
			}
		});
		dialogRef.afterClosed().pipe(takeUntil(this._destroyed)).subscribe(result => {
			if (result) { this.delete(templateId); }
		});
	}

	public delete(id: Guid) {
			this.notificationTemplateService.delete(id, null).pipe(takeUntil(this._destroyed))
				.subscribe(
					complete => this.refreshTemplates(),
					error => this.onCallbackError(error)
				);
	}
}
