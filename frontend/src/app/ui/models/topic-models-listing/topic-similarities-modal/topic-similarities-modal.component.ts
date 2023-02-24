import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TopicSimilarity } from "@app/core/model/model/topic-model.model";
import { TopicModelService } from "@app/core/services/http/topic-model.service";
import { BaseComponent } from "@common/base/base.component";
import { BehaviorSubject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-topic-similarities-modal',
  templateUrl: './topic-similarities-modal.component.html',
  styleUrls: ['./topic-similarities-modal.component.scss']
})
export class TopicSimilaritiesComponent extends BaseComponent implements OnInit {

  private _similarities: TopicSimilarity
  private defaultPairs: number = 2;
  protected pairs: BehaviorSubject<number> = new BehaviorSubject(null);
  protected loading: boolean = true;

  protected formGroup: FormGroup;

  get name() {
    return this.data?.name;
  }

  get similarities() {
    return this._similarities;
  }

  valid() {
    return true;
  }

  constructor(
    private dialogRef: MatDialogRef<TopicSimilaritiesComponent>,
    private topicModelService: TopicModelService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data
  ) {
    super();
  }

  ngOnInit(): void {
    this.pairs.next(this.defaultPairs);
    this.formGroup = this.formBuilder.group({
      pairs: new FormControl(this.defaultPairs)
    });
    this.formGroup.disable({
      emitEvent: false
    });
    this.formGroup.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(600)
    ).subscribe(change => {
      this.pairs.next(change["pairs"]);
    });
    this.pairs.subscribe((_pairs) => {
      if (_pairs) {
        this.formGroup.disable({
          emitEvent: false
        });
        this.loading = true;
        this.topicModelService.getSimilarTopics(this.name, { pairs: _pairs }).subscribe(response => {
          this._similarities = response.items[0];
          this.loading = false;
          this.formGroup.enable({
            emitEvent: false
          });
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}