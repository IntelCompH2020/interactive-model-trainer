import { Component, HostListener } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-base-pending-changes-component',
	template: ''
})
export abstract class BasePendingChangesComponent extends BaseComponent {

	protected constructor() { super(); }

	abstract canDeactivate(): boolean | Observable<boolean>;

	@HostListener('window:beforeunload', ['$event'])
	unloadNotification($event: any) {
		if (!this.canDeactivate()) {
			$event.returnValue = true;
		}
	}
}
