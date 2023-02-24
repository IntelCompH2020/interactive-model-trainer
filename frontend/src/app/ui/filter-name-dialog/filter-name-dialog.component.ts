import { OnInit, Inject, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
	selector: 'app-filter-name-dialog',
	templateUrl: './filter-name-dialog.component.html',
	styleUrls: ['./filter-name-dialog.component.scss']
})
export class FilterNameDialogComponent implements OnInit {
	protected formBuilder: FormBuilder = new FormBuilder();
	nameFormGroup: FormGroup = null;

	constructor(public dialogRef: MatDialogRef<FilterNameDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
		this.nameFormGroup = this.formBuilder.group({
			name: new FormControl(this.data.name, [Validators.required, Validators.pattern(/[\S]/)]),
		});
	}

}
