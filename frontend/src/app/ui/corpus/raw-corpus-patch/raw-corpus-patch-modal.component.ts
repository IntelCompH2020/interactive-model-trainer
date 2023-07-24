import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomainModel } from "@app/core/model/model/domain-model.model";
import { TopicModel } from "@app/core/model/model/topic-model.model";
import { TranslateService } from "@ngx-translate/core";
import { nameof } from "ts-simple-nameof";
import { LogicalCorpus } from "@app/core/model/corpus/logical-corpus.model";
import { CorpusVisibility } from "@app/core/enum/corpus-visibility.enum";
import { LogicalCorpusService } from "@app/core/services/http/logical-corpus.service";
import { RawCorpusPatchEditorModel } from "./raw-corpus-patch-editor.model";
import { RawCorpus } from "@app/core/model/corpus/raw-corpus.model";
import { RawCorpusService } from "@app/core/services/http/raw-corpus.service";

@Component({
  selector: 'app-raw-corpus-patch-modal',
  templateUrl: './raw-corpus-patch-modal.component.html',
  styleUrls: ['./raw-corpus-patch-modal.component.scss']
})
export class RawCorpusPatchComponent implements OnInit {

  editorModel: RawCorpusPatchEditorModel;
  formGroup: FormGroup;

  get valid(): boolean {
    return this.formGroup?.valid;
  }

  get corpus(): RawCorpus {
    return this.data['corpus'];
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<LogicalCorpus>(x => x.visibility))?.value === CorpusVisibility.Private);
  }

  get canPrivate(): boolean {
    return false;
  }

  constructor(
    private dialogRef: MatDialogRef<RawCorpusPatchComponent>,
    private rawCorpusService: RawCorpusService,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new RawCorpusPatchEditorModel().fromModel(this.corpus);
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
    this.rawCorpusService.patch(Object.assign(this.corpus, this.formGroup.value)).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

}