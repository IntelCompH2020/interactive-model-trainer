import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tenant } from '@app/core/model/tenant/tenant.model';
import { BaseComponent } from '@common/base/base.component';
import { FormService } from '@common/forms/form-service';
@Component({
	selector: 'tenant-choose-dialog',
	templateUrl: './tenant-choose-dialog.component.html',
	styleUrls: ['./tenant-choose-dialog.component.scss']
})

export class TenantChooseDialogComponent extends BaseComponent implements OnInit, AfterViewInit {
	formGroup: FormGroup = null;
	protected formBuilder: FormBuilder = new FormBuilder();
	public showInfoMessage = false;

	constructor(
		public dialogRef: MatDialogRef<TenantChooseDialogComponent>,
		private formService: FormService,
		private changeDetectorRef: ChangeDetectorRef,
		@Inject(MAT_DIALOG_DATA) public data: {tenants: Tenant[]}
	) {
		super();
	}
	ngAfterViewInit() {
		this.changeDetectorRef.detectChanges();
	}
	ngOnInit(): void {
		this.formGroup = this.formBuilder.group({
			tenantCode: ['default', [Validators.required]],
		});
	}

	formSubmit(): void {
		this.formService.touchAllFormFields(this.formGroup);
		if (!this.isFormValid()) { this.showInfoMessage = false; return; }

		this.dialogRef.close(this.formGroup.value);
	}

	public isFormValid(): Boolean {
		return this.formGroup.valid;
	}

	public cancel(): void {
		this.dialogRef.close(null);
	}

	public save() {
		this.clearErrorModel();
		this.formSubmit();
	}

	clearErrorModel() {
		this.formService.validateAllFormFields(this.formGroup);
	}
}
