import { NgModule } from '@angular/core';
import { CommonFormsModule } from '@common/forms/common-forms.module';
import { AutoCompleteModule } from '@common/modules/auto-complete/auto-complete.module';
import { ConfirmationDialogModule } from '@common/modules/confirmation-dialog/confirmation-dialog.module';
import { ListingModule } from '@common/modules/listing/listing.module';
import { TextFilterModule } from '@common/modules/text-filter/text-filter.module';
import { CommonUiModule } from '@common/ui/common-ui.module';
import { NotificationServiceFormattingModule } from '@notification-service/core/formatting/formatting.module';
import { NotificationTemplateFieldOptionsEditorComponent } from '@notification-service/ui/notification-template/editor/field-options/field-options-editor.component';
import { NotificationTemplateEditorComponent } from '@notification-service/ui/notification-template/editor/notification-template-editor.component';
import { NotificationTemplateListingComponent } from '@notification-service/ui/notification-template/listing/notification-template-listing.component';
import { NotificationTemplateRoutingModule } from '@notification-service/ui/notification-template/notification-template-routing.module';
import { EditorModule } from '@tinymce/tinymce-angular';

@NgModule({
	imports: [
		CommonUiModule,
		CommonFormsModule,
		ConfirmationDialogModule,
		ListingModule,
		TextFilterModule,
		NotificationServiceFormattingModule,
		NotificationTemplateRoutingModule,
		AutoCompleteModule,
		EditorModule
	],
	declarations: [
		NotificationTemplateListingComponent,
		NotificationTemplateEditorComponent,
		NotificationTemplateFieldOptionsEditorComponent
	]
})
export class NotificationTemplateModule { }
