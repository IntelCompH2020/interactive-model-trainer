import { Component, OnInit } from '@angular/core';
import { IsActive } from '@app/core/enum/is-active.enum';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { TopicModel } from '@app/core/model/model/topic-model.model';
import { TopicModelLookup } from '@app/core/query/topic-model.lookup';
import { TopicModelService } from '@app/core/services/http/topic-model.service';
import { BaseComponent } from '@common/base/base.component';
import { nameof } from 'ts-simple-nameof';
import { HowToConfig } from './how-to-card/how-to-card.component';
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends BaseComponent implements OnInit {

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
				nameof<TopicModel>(x => x.location),
				nameof<TopicModel>(x => x.hierarchyLevel)
			]
		};
		lookup.hierarchyLevel = 0;
		lookup.visibilities = [ModelVisibility.Public];
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

	wordlistsConfig: HowToConfig = {
		title: "APP.HOME-COMPONENT.HOW-TO-WORD-LIST",
		subtitle: "APP.HOME-COMPONENT.HOW-TO-WORD-LIST-DESCRIPTION",
		expanded: false,
		guides: [
			{
				label: "Stopwords and equivalences",
				source: "stopwords-equivalences-guide.md"
			},
			{
				label: "Keywords",
				source: "keywords-guide.md"
			}
		]
	}

	corporaConfig: HowToConfig = {
		title: "APP.HOME-COMPONENT.CORPUS",
		subtitle: "APP.HOME-COMPONENT.HOW-TO-CORPUS-DESCRIPTION",
		expanded: false,
		guides: [
			{
				label: "Raw corpora",
				source: "raw-corpora-guide.md"
			},
			{
				label: "Logical corpora",
				source: "logical-corpora-guide.md"
			}
		]
	}

	modelsConfig: HowToConfig = {
		title: "APP.HOME-COMPONENT.MODELS",
		subtitle: "APP.HOME-COMPONENT.HOW-TO-MODELS-DESCRIPTION",
		expanded: false,
		guides: [
			{
				label: "Domain models",
				source: "domain-models-guide.md"
			},
			{
				label: "Topic models",
				source: "topic-models-guide.md"
			}
		]
	}

}

interface RecentItem {
	name: string;
	location: string;
	href: string;
}