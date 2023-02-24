
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { AuthService } from '@app/core/services/ui/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-editor-actions-component',
	templateUrl: './editor-actions.component.html',
	styleUrls: ['./editor-actions.component.scss']
})
export class EditorActionsComponent extends BaseComponent {

	@Output() onSave: EventEmitter<void> = new EventEmitter<void>();
	@Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
	@Output() onDelete: EventEmitter<void> = new EventEmitter<void>();

	_canDelete = false;
	@Input() set canDelete(val: boolean) {
		this._canDelete = val;
		this.recalculateActions();
	}

	_canSave = false;
	@Input() set canSave(val: boolean) {
		this._canSave = val;
		this.recalculateActions();
	}

	canDeleteEntity: boolean;
	canSaveEntity: boolean;

	constructor(
		private language: TranslateService,
		public authService: AuthService,
	) {
		super();
	}

	recalculateActions(): void {
		this.canDeleteEntity = this._canDelete;
		this.canSaveEntity = this._canSave;
	}

	save(): void {
		this.onSave.emit();
	}

	delete() {
		this.onDelete.emit();
	}

	cancel(): void {
		this.onCancel.emit();
	}
}
