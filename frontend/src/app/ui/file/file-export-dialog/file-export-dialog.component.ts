import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-file-export-dialog',
	templateUrl: './file-export-dialog.component.html',
	styleUrls: ['./file-export-dialog.component.scss']
})
export class FileExportDialogComponent implements OnInit {

  protected url;
  protected size;

	constructor(
		public dialogRef: MatDialogRef<FileExportDialogComponent>,
    private sanitizer: DomSanitizer,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}
  ngOnInit(): void {
    let blob = new Blob([this.data.payload], {type: 'application/json'});
    this.size = Math.ceil(blob.size / 1000);
    this.url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
  }

	cancel() {
		this.dialogRef.close(false);
	}

	confirm() {
		this.dialogRef.close(true);
	}
}
