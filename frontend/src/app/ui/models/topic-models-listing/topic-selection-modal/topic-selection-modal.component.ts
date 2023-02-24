import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Topic } from "@app/core/model/model/topic-model.model";
import { TopicLookup } from "@app/core/query/topic.lookup";
import { TopicModelService } from "@app/core/services/http/topic-model.service";

@Component({
  selector: 'app-topic-selection-modal',
  templateUrl: './topic-selection-modal.component.html',
  styleUrls: ['./topic-selection-modal.component.scss']
})
export class TopicSelectionComponent implements OnInit {

  private _topics: Topic[] = []
  protected selectedTopics: number[] = [];
  protected loading: boolean = true;

  get name() {
    return this.data?.name;
  }

  get lookup() {
    return this.data?.lookup as TopicLookup;
  }

  get topics() {
    return this._topics;
  }

  selectTopic(topic: Topic) {
    if (this.topicSelected(topic)) this.selectedTopics.splice(this.selectedTopics.indexOf(topic.id), 1);
    else this.selectedTopics.push(topic.id);
  }

  selectAllTopics() {
    if (this.selectedTopics.length) {
      if (this.selectedTopics.length !== this._topics.length) {
        this.selectedTopics = [];
        for (let topic of this._topics) {
          this.selectedTopics.push(topic.id);
        }
      } else {
        this.selectedTopics = [];
      }
    } else {
      for (let topic of this._topics) {
        this.selectedTopics.push(topic.id);
      }
    }

  }

  topicSelected(topic: Topic) {
    return this.selectedTopics.includes(topic.id);
  }

  allTopicsSelected() {
    return this.selectedTopics.length > 0 && this.selectedTopics.length === this._topics.length;
  }

  valid() {
    if (this.data.options?.minItems) return this.selectedTopics.length >= this.data.options.minItems;
    else return true;
  }

  constructor(
    private dialogRef: MatDialogRef<TopicSelectionComponent>,
    private topicModelService: TopicModelService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    let _lookup = new TopicLookup();
    _lookup.project = this.lookup.project;
    _lookup.like = this.lookup.like;
    this.topicModelService.queryTopics(this.name, _lookup).subscribe(response => {
      this._topics = response.items;
      this.loading = false;
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  close(): void {
    this.dialogRef.close(this.selectedTopics);
  }

}