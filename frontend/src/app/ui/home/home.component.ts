import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@common/base/base.component';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends BaseComponent implements OnInit{


	recentItems: RecentItem[] = Array(3).fill(0).map((_, index) =>({
		href: '#',
		name: 'cordis-80-topics-2022-03-03' + index,
		location: 'hdfs://inteComp/models/' + index
	}));


	constructor(
	) {
		super();
	}

	ngOnInit(): void {
	}

}

interface RecentItem{
	name: string;
	location: string;
	href: string;
}