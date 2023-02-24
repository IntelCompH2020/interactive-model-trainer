import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

	loaderModes: any = LoaderMode;
	@Input() isLoading = false;
	@Input() size = 1;
	@Input() message: string;
	@Input() mode: LoaderMode = LoaderMode.Spinner;


	constructor() { }

	ngOnInit() { }

}

export enum LoaderMode {
	Spinner = 'spinner',
	ProgressBar = 'progress-bar'
}
