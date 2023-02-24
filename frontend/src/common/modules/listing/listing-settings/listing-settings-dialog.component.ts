import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColumnDefinition } from '@common/modules/listing/listing.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	templateUrl: 'listing-settings-dialog.component.html',
	styleUrls: ['listing-settings-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ListingSettingsDialogComponent {

	availableColumns: ColumnDefinition[] = [];
	visibleColumns: string[] = [];

	constructor(
		public dialogRef: MatDialogRef<ListingSettingsDialogComponent>,
		private language: TranslateService,
		@Inject(MAT_DIALOG_DATA) public dialogData: any) {
		this.availableColumns = dialogData.availableColumns;
		this.visibleColumns = dialogData.visibleColumns;
	}

	apply() {
		this.dialogRef.close({
			visibleColumns: this.visibleColumns,
		});
	}

	getColumnName(column: ColumnDefinition): string {
		return column.languageName ? this.language.instant(column.languageName) : column.name;
	}
}
