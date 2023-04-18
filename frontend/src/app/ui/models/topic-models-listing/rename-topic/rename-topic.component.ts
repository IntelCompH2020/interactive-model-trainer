import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Topic } from "@app/core/model/model/topic-model.model";
import { TopicLookup } from "@app/core/query/topic.lookup";
import { TopicModelService } from "@app/core/services/http/topic-model.service";
import { TranslateService } from "@ngx-translate/core";
import { nameof } from "ts-simple-nameof";

@Component({
  selector: 'app-rename-topic',
  templateUrl: './rename-topic.component.html',
  styleUrls: ['./rename-topic.component.scss']
})
export class RenameTopicComponent implements OnInit {

  formGroup: FormGroup;
  private topics: Topic[] = [];
  private labels: string[] = [];

  get label() {
    return this.data.topic?.label;
  }

  get modelName() {
    return this.data.model?.name;
  }

  get valid() {
    return this.data?.model && this.formGroup.valid && this.topics.length > 0
  }

  constructor(
    private dialogRef: MatDialogRef<RenameTopicComponent>,
    private topicModelService: TopicModelService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    this.formGroup = new FormGroup({
      label: new FormControl("", [Validators.required, Validators.pattern(/[\S]/)])
    });
  }

  ngOnInit(): void {
    this.loadTopicLabels();
  }

  submit(): void {
    if (this.valid) {
      this.updateTopicLabels();
      this.topicModelService.setTopicLabels(this.modelName, { labels: this.labels })
        .subscribe(
          _response => {
            this.dialogRef.close(true);
          }, error => console.error(error)
        );
    }
  }

  private updateTopicLabels(): void {
    this.labels[this.data.topic.id as number] = this.formGroup.value["label"]
  }

  private loadTopicLabels(): void {
    let _lookup = new TopicLookup();
    _lookup.project = {
      fields: [
        nameof<Topic>(x => x.id),
        nameof<Topic>(x => x.label)
      ]
    };
    this.topicModelService.queryTopics(this.modelName, _lookup).subscribe((response) => {
      this.topics = response.items;
      for (let topic of this.topics) {
        this.labels.push(topic.label);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}