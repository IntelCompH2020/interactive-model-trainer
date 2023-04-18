import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Topic } from "@app/core/model/model/topic-model.model";
import { TopicLookup } from "@app/core/query/topic.lookup";
import { TopicModelService } from "@app/core/services/http/topic-model.service";
import { nameof } from "ts-simple-nameof";

@Component({
  selector: 'app-topic-labels-modal',
  templateUrl: './topic-labels-modal.component.html',
  styleUrls: ['./topic-labels-modal.component.scss']
})
export class TopicLabelsComponent implements OnInit {

  private _topics: Topic[] = []
  protected labels: string[] = [];
  protected loading: boolean = true;

  file: {
    name?: string,
    contents?: string
  } = {}

  formGroup: FormGroup;

  get name() {
    return this.data?.name;
  }

  get topics() {
    return this._topics;
  }

  get labelsInputs(): FormArray {
    return this.formGroup.get('labels') as FormArray;
  }

  valid() {
    return this.formGroup?.dirty || false;
  }

  constructor(
    private dialogRef: MatDialogRef<TopicLabelsComponent>,
    private topicModelService: TopicModelService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    let _lookup = new TopicLookup();
    _lookup.project = {
      fields: [
        nameof<Topic>(x => x.id),
        nameof<Topic>(x => x.wordDescription),
        nameof<Topic>(x => x.label)
      ]
    };
    this.topicModelService.queryTopics(this.name, _lookup).subscribe(response => {
      this._topics = response.items;
      this.formGroup = this.formBuilder.group({
        labels: this.formBuilder.array([])
      })
      for (let topic of this._topics) {
        this.labelsInputs.push(new FormControl(topic.label));
      }
      this.loading = false;
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  close(): void {
    this.dialogRef.close(this.getLabels());
  }

  private getLabels(): string[] {
    return this.formGroup.value?.labels as string[];
  }

  onFileSelected(files: FileList) {
    this.file.name = files.item(0).name;
    let reader: FileReader = new FileReader();
    reader.onloadend = (_ev => {
      this.file.contents = reader.result.toString();
      let labels = this.file.contents.split('\n');
      if (this._topics.length === labels.length) {
        this.formGroup.patchValue({"labels": labels});
        this.formGroup.markAsDirty();
      }
    });
    reader.readAsText(files[0]);
  }

}