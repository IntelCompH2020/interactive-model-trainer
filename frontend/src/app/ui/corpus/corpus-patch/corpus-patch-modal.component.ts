import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomainModel } from "@app/core/model/model/domain-model.model";
import { TopicModel } from "@app/core/model/model/topic-model.model";
import { TranslateService } from "@ngx-translate/core";
import { nameof } from "ts-simple-nameof";
import { CorpusPatchEditorModel } from "./corpus-patch-editor.model";
import { LogicalCorpus } from "@app/core/model/corpus/logical-corpus.model";
import { CorpusVisibility } from "@app/core/enum/corpus-visibility.enum";
import { LogicalCorpusService } from "@app/core/services/http/logical-corpus.service";

@Component({
  selector: 'app-corpus-patch-modal',
  templateUrl: './corpus-patch-modal.component.html',
  styleUrls: ['./corpus-patch-modal.component.scss']
})
export class CorpusPatchComponent implements OnInit {

  editorModel: CorpusPatchEditorModel;
  formGroup: FormGroup;

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get corpus(): LogicalCorpus {
    return this.data['corpus'];
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<LogicalCorpus>(x => x.visibility))?.value === CorpusVisibility.Private);
  }

  get canPrivate(): boolean {
    return this.corpus.creator != null && this.corpus.creator != "-"
  }

  constructor(
    private dialogRef: MatDialogRef<CorpusPatchComponent>,
    private logicalCorpusService: LogicalCorpusService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new CorpusPatchEditorModel().fromModel(this.corpus);
      this.formGroup = this.editorModel.buildForm();
    }, 0);
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<TopicModel | DomainModel>(x => x.visibility))
      .setValue(
        change.checked ?
          CorpusVisibility.Private
          :
          CorpusVisibility.Public
      );
  }

  update(): void {
    this.logicalCorpusService.patch(Object.assign(this.corpus, this.formGroup.value)).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

}