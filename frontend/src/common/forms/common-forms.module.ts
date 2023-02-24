import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PendingChangesGuard } from '@common/forms/pending-form-changes/pending-form-changes-guard.service';

@NgModule({
	imports: [
		FormsModule,
		ReactiveFormsModule,
	],
	exports: [
		FormsModule,
		ReactiveFormsModule,
	],
	providers: [
		PendingChangesGuard
	]
})
export class CommonFormsModule { }
