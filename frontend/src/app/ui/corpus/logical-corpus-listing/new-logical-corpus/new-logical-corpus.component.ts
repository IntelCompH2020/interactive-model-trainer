import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { RawCorpus, RawCorpusFieldPersist } from '@app/core/model/corpus/raw-corpus.model';
import { RawCorpusLookup } from '@app/core/query/raw-corpus.lookup';
import { RawCorpusService } from '@app/core/services/http/raw-corpus.service';
import { BaseComponent } from '@common/base/base.component';
import { takeUntil } from 'rxjs/operators';
import { nameof } from 'ts-simple-nameof';
import { getLogicalCorpusUses, LogicalCorpusEditorModel } from '../logical-corpus-editor.model';
import { MergeLogicalCorpusComponent } from './merge-logical-corpus/merge-logical-corpus.component';

@Component({
  selector: 'app-logical-raw-corpus',
  templateUrl: './new-logical-corpus.component.html',
  styleUrls: ['./new-logical-corpus.component.scss']
})
export class NewLogicalCorpusComponent extends BaseComponent implements OnInit {

  formGroup: FormGroup;
  selectAllFormGroup: FormGroup;

  editorModel: LogicalCorpusEditorModel;

  fieldsCount: number = 0;
  selectedFieldsCount: number = 0;
  fieldsCheckboxControls: FormControl[] = [];
  fieldsTypesControls: FormControl[] = [];

  get corporaArray(): FormArray {
    return this.formGroup?.get('corpora') as FormArray;
  }

  get isPrivate(): boolean {
    return !!(this.formGroup?.get(nameof<LogicalCorpus>(x => x.visibility))?.value === CorpusVisibility.Private);
  }

  availableCorpora: RawCorpus[];
  corpusValidFor = getLogicalCorpusUses();

  public availableFieldTypes: any = {
    TM: [
      { value: null, label: "Select type" },
      { value: "id", label: "Id" },
      { value: "title", label: "Title" },
      { value: "text", label: "Text" },
      { value: "lemmas", label: "Lemmas" },
      { value: "embeddings", label: "Embeddings" },
    ],
    DC: [
      { value: null, label: "Select type" },
      { value: "id", label: "Id" },
      { value: "title", label: "Title" },
      { value: "text", label: "Text" },
      { value: "lemmas", label: "Lemmas" },
      { value: "embeddings", label: "Embeddings" },
    ]
  }

  print(item: any) {
    console.log(item);
  }

  constructor(
    private dialogRef: MatDialogRef<NewLogicalCorpusComponent>,
    private dialog: MatDialog,
    private rawCorpusService: RawCorpusService
  ) {
    super();

    this.refresh("TM");
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  protected getRawCorpusLookup(): RawCorpusLookup {
    const lookup = new RawCorpusLookup();
    lookup.metadata = { countAll: true };
    lookup.page = { offset: 0, size: 10 };
    lookup.isActive = [IsActive.Active];
    lookup.order = { items: ['-' + nameof<RawCorpus>(x => x.download_date)] };

    lookup.project = {
      fields: [
        nameof<RawCorpus>(x => x.id),
        nameof<RawCorpus>(x => x.name),
        nameof<RawCorpus>(x => x.description),
        nameof<RawCorpus>(x => x.visibility),
        nameof<RawCorpus>(x => x.schema)
      ]
    };

    return lookup;
  }

  onFieldSelection(checked: boolean, typeControl: FormControl) {
    if (checked) {
      this.selectedFieldsCount++;
      typeControl.enable();
    }
    else {
      this.selectedFieldsCount--;
      typeControl.setValue(null);
      typeControl.disable();
    }
    this.updateSelectAllControl(this.selectedFieldsCount == this.fieldsCount);
  }

  onAllFieldsSelection(checked: boolean) {
    if (checked) {
      this.fieldsCheckboxControls.forEach(control => {
        control.setValue(true, { emitEvent: false });
      });
      this.fieldsTypesControls.forEach(control => {
        control.enable();
      });
      this.selectedFieldsCount = this.fieldsCount;
    }
    else {
      this.fieldsCheckboxControls.forEach(control => {
        control.setValue(false, { emitEvent: false });
      });
      this.fieldsTypesControls.forEach(control => {
        control.setValue(null);
        control.disable();
      });
      this.selectedFieldsCount = 0;
    }
  }

  onPrivateChange(change: MatCheckboxChange): void {
    this.formGroup.get(nameof<LogicalCorpus>(x => x.visibility))
      .setValue(
        change.checked ?
          CorpusVisibility.Private
          :
          CorpusVisibility.Public
      );
  }

  onValidForSelected(event: MatSelectChange) {
    this.refresh(event.value);
  }

  canMerge(): boolean {
    return this.selectedFieldsCount > 0 && this.formGroup.value['name']
  }

  mergeCorpus(): void {
    this.dialog.open(MergeLogicalCorpusComponent, {
      width: "50rem",
      maxWidth: "90vw",
      disableClose: true,
      data: this.formGroup.value,
    }).afterClosed().subscribe(result => {
      if (result) this.dialogRef.close(true);
    });
  }

  addCorpus(corpus: RawCorpus): void {
    const formGroup = this.editorModel.buildCorpusFormGroup(this.availableCorpora?.length ?? 0, {
      corpusId: corpus.id,
      corpusName: corpus.name,
      corpusSelections: corpus.schema.map(function (x) {
        if (x == "id") this.selectedFieldsCount++;
        return { name: x, selected: x == "id", type: x == "id" ? "id" : null }
      }, this)
    })

    this.fieldsCount += corpus.schema.length;

    this.updateSelectAllControl(false);

    //Collect the added checkboxes
    let selectionsFormGroup: FormGroup = formGroup.get('corpusSelections') as FormGroup;
    Object.keys(selectionsFormGroup.controls).forEach(key => {
      this.fieldsCheckboxControls.push((selectionsFormGroup.controls[key] as FormGroup).get('selected') as FormControl);
      this.fieldsTypesControls.push((selectionsFormGroup.controls[key] as FormGroup).get('type') as FormControl);
    });

    this.corporaArray.push(formGroup);

    //Only list corpora not selected yet
    this.availableCorpora = this.availableCorpora.filter(c => c['name'] !== corpus.name);
  }

  private updateSelectAllControl(value: boolean): void {
    let control: FormControl = this.selectAllFormGroup.get('selectAll') as FormControl;
    control.enable();
    control.setValue(value, { emitEvent: false });
  }

  private refresh(validFor: string): void {
    this.rawCorpusService.query(this.getRawCorpusLookup()).pipe(takeUntil(this._destroyed)).subscribe(
      response => {
        this.availableCorpora = response.items;
      }
    )

    this.fieldsCount = 0;
    this.selectedFieldsCount = 0;
    this.fieldsCheckboxControls = [];
    this.fieldsTypesControls = [];

    this.editorModel = new LogicalCorpusEditorModel();
    this.formGroup = this.editorModel.buildForm();
    this.formGroup.patchValue({
      validFor
    });
    this.selectAllFormGroup = new FormGroup({
      selectAll: new FormControl({ value: false, disabled: true })
    });
  }

}