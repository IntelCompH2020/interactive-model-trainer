import { Component, OnInit } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicModelLookup } from '@app/core/query/topic-model.lookup';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { BaseComponent } from '@common/base/base.component';
import { lookup } from 'dns';
import { nameof } from 'ts-simple-nameof';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends BaseComponent implements OnInit{


	recentItems: RecentItem[] = [];
	modelsLoading: boolean = true;

	constructor(
		private topicModelService: TopicModelService
	) {
		super();
	}

	ngOnInit(): void {
		let lookup = new TopicModelLookup();
		lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: 3 };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<TopicModel>(x => x.creation_date)] };
		lookup.project = {
      fields: [
        nameof<TopicModel>(x => x.name),
        nameof<TopicModel>(x => x.location)
      ]
    };
		lookup.hierarchyLevel = 0;
		this.topicModelService.query(lookup).subscribe(models => {
			this.recentItems = models.items.map(item => {
				this.modelsLoading = false;
				return {
					name: item.name,
					location: item.location,
					href: "/models/topic"
				}
			})
		});
	}

}

interface RecentItem{
	name: string;
	location: string;
	href: string;
}