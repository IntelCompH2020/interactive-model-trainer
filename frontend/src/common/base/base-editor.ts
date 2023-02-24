import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { QueryParamsService } from '@app/core/services/ui/query-params.service';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { BaseEntity } from '@common/base/base-entity.model';
import { BasePendingChangesComponent } from '@common/base/base-pending-changes.component';
import { FormService } from '@common/forms/form-service';
import { HttpError, HttpErrorHandlingService } from '@common/modules/errors/error-handling/http-error-handling.service';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { FilterService } from '@common/modules/text-filter/filter-service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { Guid } from '../types/guid';

@Component({
	selector: 'app-base-editor-component',
	template: ''
})
export abstract class BaseEditor<EditorModelType extends BaseEditorModel, EntityType> extends BasePendingChangesComponent implements OnInit {

	isNew = true;
	isDeleted = false;
	formGroup: FormGroup = null;
	lookupParams: any;

	// Getter Setter for editorModel. We use it to notify when the editor model is changed.
	get editorModel(): EditorModelType { return this._editorModel; }
	set editorModel(value: EditorModelType) { this._editorModel = value; }
	private _editorModel: EditorModelType;
	protected lv = 0;


	abstract getItem(itemId: Guid, successFunction: (item: EntityType) => void): void;
	abstract prepareForm(data: EntityType): void;
	abstract formSubmit(): void;
	abstract delete(): void;
	abstract refreshData(): void;
	abstract refreshOnNavigateToData(id?: Guid): void;
	abstract persistEntity(onSuccess?: (response) => void): void;
	abstract buildForm(): void;

	constructor(
		protected dialog: MatDialog,
		protected language: TranslateService,
		protected formService: FormService,
		protected router: Router,
		protected uiNotificationService: UiNotificationService,
		protected httpErrorHandlingService: HttpErrorHandlingService,
		protected filterService: FilterService,
		protected datePipe: DatePipe,
		protected route: ActivatedRoute,
		protected queryParamsService: QueryParamsService
	) { super(); }

	public ngOnInit(): void {
		const entity = this.route.snapshot.data['entity'] as EntityType;
		if(entity) {
			this.prepareForm(entity);
			this.isNew = false;
		}else{
			this.prepareForm(null);
		}

		this.route.queryParamMap.pipe(takeUntil(this._destroyed)).subscribe((params: ParamMap) => {
			// If lookup is on the query params load it
			if (params.keys.length > 0 && params.has('lookup')) {
				this.lookupParams = this.queryParamsService.deSerializeLookup(params.get('lookup'));
			}
		});
	}

	public isFormValid() {
		return this.formGroup.valid;
	}

	public isFormDisabled() {
		return this.formGroup.disabled;
	}

	public save() {
		this.clearErrorModel();
	}

	public cancel(): void {
		this.router.navigate(['..'], { relativeTo: this.route, queryParams: { 'lookup': this.queryParamsService.serializeLookup(this.lookupParams), 'lv': ++this.lv }, replaceUrl: true });// ! lv is always zero . replaceUrl?
	}

	

	onCallbackSuccess(data?: any): void {
		this.uiNotificationService.snackBarNotification(this.isNew ? this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-CREATION') : this.language.instant('COMMONS.SNACK-BAR.SUCCESSFUL-UPDATE'), SnackBarNotificationLevel.Success);
		this.refreshOnNavigateToData(data ? data.id : null);
	}

	onCallbackError(errorResponse: HttpErrorResponse) {
		const error: HttpError = this.httpErrorHandlingService.getError(errorResponse);
		if (error.statusCode === 400) {
			this.editorModel.validationErrorModel.fromJSONObject(errorResponse.error);
			this.formService.validateAllFormFields(this.formGroup);
		} else {
			this.uiNotificationService.snackBarNotification(error.getMessagesString(), SnackBarNotificationLevel.Warning);
		}
	}

	clearErrorModel() {
		this.editorModel.validationErrorModel.clear();
		this.formService.validateAllFormFields(this.formGroup);
	}

	

	// private refreshOnNavigateToData(id?: Guid): void {
	// 	if (this.isNew) {
	// 		this.formGroup.markAsPristine();
	// 		this.router.navigate([this.formUtilsService.getFormRoute(this.editorModel.type) + '/' + (id ? id : this.editorModel.id)]);
	// 	} else { this.internalRefreshData(); }
	// }

	internalRefreshData(): void {
		// setTimeout(() => {
		// 	this.formGroup = null;
		// 	this.editorModel = null;
		// });
		this.refreshData();
	}

	

	canDeactivate(): boolean | Observable<boolean> {
		return this.formGroup ? !this.formGroup.dirty : true;
	}

	public static commonFormFieldNames(): string[] {
		return [
			nameof<BaseEntity>(x => x.id),
			nameof<BaseEntity>(x => x.isActive),
			nameof<BaseEntity>(x => x.createdAt),
			nameof<BaseEntity>(x => x.updatedAt),
			nameof<BaseEntity>(x => x.hash),
		];
	}
}
