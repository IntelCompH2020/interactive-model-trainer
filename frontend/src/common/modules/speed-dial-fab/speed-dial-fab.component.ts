import { Component, Input, ViewEncapsulation } from '@angular/core';
import { speedDialFabAnimations } from '@common/modules/speed-dial-fab/speed-dial-fab.animations';

@Component({
	selector: 'app-speed-dial-fab',
	templateUrl: './speed-dial-fab.component.html',
	styleUrls: ['./speed-dial-fab.component.scss'],
	animations: speedDialFabAnimations,
	encapsulation: ViewEncapsulation.None
})
export class SpeedDialFabComponent {

	@Input() options: SpeedDialFabOption[];

	_options: SpeedDialFabOption[] = [];
	fabTogglerState = 'inactive';

	constructor() { }

	showItems() {
		this.fabTogglerState = 'active';
		this._options = this.options;
	}

	hideItems() {
		this.fabTogglerState = 'inactive';
		this._options = [];
	}

	onToggleFab() {
		this._options.length ? this.hideItems() : this.showItems();
	}

	optionClicked(index: number) {
		this._options[index].action();
		this.hideItems();
	}
}

export interface SpeedDialFabOption {
	icon: string;
	description: string;
	action: () => void;
}
