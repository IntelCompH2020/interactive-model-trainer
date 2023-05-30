import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ModelVisibility } from "@app/core/enum/model-visibility.enum";
import { DomainModel } from "@app/core/model/model/domain-model.model";
import { TopicModel } from "@app/core/model/model/topic-model.model";
import { DomainModelService } from "@app/core/services/http/domain-model.service";
import { TopicModelService } from "@app/core/services/http/topic-model.service";
import { TranslateService } from "@ngx-translate/core";
import { nameof } from "ts-simple-nameof";
import { ModelPatchEditorModel } from "./model-patch-editor.model";

@Component({
  selector: 'app-model-patch-modal',
  templateUrl: './model-patch-modal.component.html',
  styleUrls: ['./model-patch-modal.component.scss']
})
export class ModelPatchComponent implements OnInit {

  editorModel: ModelPatchEditorModel;
  formGroup: FormGroup;

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<TopicModel | DomainModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get model(): TopicModel | DomainModel {
    return this.data['model'];
  }

  get modelType(): string {
    return this.data['modelType'];
  }

  get isDomainModel(): boolean {
    return this.modelType === 'DOMAIN';
  }

  constructor(
    private dialogRef: MatDialogRef<ModelPatchComponent>,
    private topicModelService: TopicModelService,
    private domainModelService: DomainModelService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new ModelPatchEditorModel().fromModel(this.model);
      this.formGroup = this.editorModel.buildForm();
    }, 0);
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<TopicModel | DomainModel>(x => x.visibility))
      .setValue(
        change.checked ?
          ModelVisibility.Private
          :
          ModelVisibility.Public
      );
  }

  update(): void {
    if (!this.isDomainModel) {
      if ((this.model as TopicModel).hierarchyLevel === 0) {
        this.topicModelService.update(this.formGroup.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.topicModelService.updateHierarchical((this.model as TopicModel).TrDtSet, this.formGroup.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      }

    } else {
      this.domainModelService.update(this.formGroup.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

}