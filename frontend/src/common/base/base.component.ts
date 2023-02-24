import { Component, OnDestroy } from '@angular/core';
import { SnackBarNotificationLevel, UiNotificationService } from '@common/modules/notification/ui-notification-service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-base-component',
	template: ''
})
export abstract class BaseComponent implements OnDestroy {

	protected _destroyed: Subject<boolean> = new Subject();

	protected constructor() { }

	ngOnDestroy(): void {
		this._destroyed.next(true);
		this._destroyed.complete();
	}

}
