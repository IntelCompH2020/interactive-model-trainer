import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { DomainModelSubType, DomainModelType } from '@app/core/enum/domain-model-type.enum';
import { ModelVisibility } from '@app/core/enum/model-visibility.enum';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { DomainModel } from '@app/core/model/model/domain-model.model';
import { LogicalCorpusLookup } from '@app/core/query/logical-corpus.lookup';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { ModelSelectionService } from '@app/core/services/ui/model-selection.service';
import { nameof } from 'ts-simple-nameof';
import { DomainModelEditorModel } from '../domain-model-editor.model';

@Component({
  templateUrl: './domain-model-from-selection-function.component.html',
  styleUrls: ['./domain-model-from-selection-function.component.scss']
})
export class DomainModelFromSelectionFunctionComponent implements OnInit {

  availableTypes: DomainModelType[];
  availableSubTypes: DomainModelSubType[];

  availableCorpora: string[];

  selectedCorpus: string = undefined;

  editorModel: DomainModelEditorModel;
  formGroup: FormGroup;

  advanced: boolean = false;

  get valid() {
    return this.formGroup?.valid;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<DomainModel>(x => x.visibility))?.value === ModelVisibility.Private);
  }

  constructor(
    private dialogRef: MatDialogRef<DomainModelFromSelectionFunctionComponent>,
    public enumUtils: AppEnumUtils,
    private corpusService: LogicalCorpusService,
    protected modelSelectionService: ModelSelectionService
  ) {
    this.availableSubTypes = this.enumUtils.getEnumValues<DomainModelSubType>(DomainModelSubType);
    this.availableTypes = this.enumUtils.getEnumValues<DomainModelType>(DomainModelType);

    const lookup = new LogicalCorpusLookup();
    lookup.project = { fields: [nameof<LogicalCorpus>(x => x.name)] };
    lookup.corpusValidFor = "DC";
    this.corpusService.query(lookup).subscribe((response) => {
      const corpora = response.items;
      this.availableCorpora = corpora.map(corpus => corpus.name)
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.editorModel = new DomainModelEditorModel();
      this.formGroup = this.editorModel.buildForm();

      this.updateAdvanced(this.advanced);

      let corpusToSet: string = (this.modelSelectionService.corpus?.name && this.modelSelectionService.corpus?.valid_for === "DC") ? this.modelSelectionService.corpus?.name : "";
      if (this.selectedCorpus) corpusToSet = this.selectedCorpus;
      this.formGroup.get('corpus').setValue(corpusToSet);
    }, 0);
  }

  tableItems = Array(5).fill(0).map((_, index) => ({
    id: index,
    description: 'service.platform.infrastructure.datum.network ' + index,
    weight: (index * 0.1).toString().substring(0, 3)
  }))

  close(): void {
    this.dialogRef.close();
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<DomainModel>(x => x.visibility))
      .setValue(
        change.checked ?
          ModelVisibility.Private
          :
          ModelVisibility.Public
      );
  }

  onCorpusSelected(event: any) {
    this.selectedCorpus = event.value;
  }

  updateAdvanced(value: boolean) {
    if (!value) {
      this.formGroup.get('type').reset();
      this.formGroup.get('subtype').reset();
      this.formGroup.get('numberOfHeads').reset();
      this.formGroup.get('depth').reset();
    }
  }

  create(): void {
    this.dialogRef.close(true);
  }
}