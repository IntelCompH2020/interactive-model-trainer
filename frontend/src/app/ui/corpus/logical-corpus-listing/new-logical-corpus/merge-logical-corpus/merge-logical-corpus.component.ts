import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { LocalDataset, LogicalCorpusField, LogicalCorpusPersist, MergedCorpusField } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { BaseComponent } from '@common/base/base.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LogicalCorpusEditorModel } from '../../logical-corpus-editor.model';
import { MergeEvent, MergeEventType } from '../merged-corpus-table/merged-corpus-table.component';
import { NewMergedFieldComponent } from '../new-merged-field/new-merged-field.component';

@Component({
  selector: 'app-merge-logical-corpus',
  templateUrl: './merge-logical-corpus.component.html',
  styleUrls: ['./merge-logical-corpus.component.css']
})
export class MergeLogicalCorpusComponent extends BaseComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<MergeLogicalCorpusComponent>,
    @Inject(MAT_DIALOG_DATA) private data: LogicalCorpusEditorModel,
    private logicalCorpusService: LogicalCorpusService,
    protected dialog: MatDialog,
  ) {
    super();
  }

  get corpusData(): any {
    return this.data.corpora;
  }

  mergedFieldsData: LogicalCorpusPersist = {
    name: null,
    description: null,
    visibility: CorpusVisibility.Public,
    fields: [],
    Dtsets: []
  };

  mergedFieldsDataSubject: BehaviorSubject<LogicalCorpusPersist> = new BehaviorSubject(this.mergedFieldsData);

  ngOnInit(): void {
    this.prepareCorpusData();
    this.mergedFieldsDataSubject.next(this.mergedFieldsData);
  }

  private getCorpusData(): LogicalCorpusPersist {
    this.mergedFieldsData.name = this.data.name;
    this.mergedFieldsData.description = this.data.description;
    this.mergedFieldsData.visibility = this.data.visibility;
    let datasets: LocalDataset[] = [];
    for (let field of this.data.corpora) {
      let lemmas: string[] = [];
      for (let item of field.corpusSelections) {
        if (item.name !== "id") lemmas.push(item.name);
      }
      datasets.push({
        source: field.corpusName,
        idfld: "id",
        lemmasfld: lemmas,
        filter: ""
      });
    }
    this.mergedFieldsData.Dtsets = datasets;
    return this.mergedFieldsData;
  }

  merge(): void {
    let _data = this.getCorpusData();

    this.logicalCorpusService.create(_data).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }

  public onMergeEvent(event: MergeEvent) {
    if (event.mergeType === MergeEventType.MERGE) {

      let field: LogicalCorpusField = this.getLogicalCorpusFieldByName(event.field.name);
      let targetField: LogicalCorpusField = this.getLogicalCorpusFieldByName(event.targetFieldName);

      this.dialog.open(NewMergedFieldComponent, {
        minWidth: '25rem',
        disableClose: true
      })
        .afterClosed()
        .pipe(
          filter(x => x),
          takeUntil(this._destroyed)
        )
        .subscribe(result => {
          if (result) {

            if (targetField.originalFields.length == 1) {
              this.removeLogicalCorpusField(field);
              this.removeLogicalCorpusField(targetField);
              let originals: MergedCorpusField[] = [];
              event.field.name = event.field.name.replace(/\(\d*\)/, "");
              targetField.originalFields[0].name = targetField.originalFields[0].name.replace(/\(\d*\)/, "");
              originals.push(event.field);
              originals.push(targetField.originalFields[0]);
              this.mergedFieldsData.fields.push({
                name: result.name,
                type: result.type,
                originalFields: originals
              });
            } else {
              this.removeLogicalCorpusField(field);
              event.field.name = event.field.name.replace(/\(\d*\)/, "");
              targetField.originalFields.push(event.field);
            }
            this.updateFieldNames();
            this.mergedFieldsDataSubject.next(this.mergedFieldsData);

          }
        });
    } else {

      let targetField: LogicalCorpusField = this.getLogicalCorpusFieldByName(event.targetFieldName);

      if (targetField.originalFields.length == 2) {
        this.removeLogicalCorpusField(targetField);
        let originals: MergedCorpusField[] = targetField.originalFields;
        for (let original of originals) {
          this.mergedFieldsData.fields.push({
            name: original.name,
            type: original.type,
            originalFields: [original]
          });
        }
      } else {
        this.removeOriginalCorpusField(event.field, targetField);
        this.mergedFieldsData.fields.push({
          name: event.field.name,
          type: event.field.type,
          originalFields: [event.field]
        });
      }
      this.updateFieldNames();
      this.mergedFieldsDataSubject.next(this.mergedFieldsData);

    }
  }

  private getLogicalCorpusFieldByName(name: string): LogicalCorpusField {
    for (let field of this.mergedFieldsData.fields) {
      if (field.name === name) return field;
    }
  }

  private removeLogicalCorpusField(toRemove: LogicalCorpusField): void {
    this.mergedFieldsData.fields.forEach((field, index, array) => {
      if (field.name === toRemove.name && field.type === toRemove.type) array.splice(index, 1);
    });
  }

  private removeOriginalCorpusField(toRemove: MergedCorpusField, target: LogicalCorpusField) {
    target.originalFields.forEach((field, index, fields) => {
      if (Object.keys(field).every((key) => toRemove[key] === field[key])) fields.splice(index, 1);
    });
  }

  private updateFieldNames(): void {
    let fieldNames: Set<string> = new Set();
    for (let field of this.mergedFieldsData.fields) {
      fieldNames.add(field.name);
    }

    let sameNameIndex: Map<string, number> = new Map();
    for (let name of fieldNames) {
      sameNameIndex.set(name, 0);
    }

    for (let field of this.mergedFieldsData.fields) {
      sameNameIndex.set(field.name, sameNameIndex.get(field.name) + 1);
      let newName = sameNameIndex.get(field.name) > 1 ? field.name + "(" + sameNameIndex.get(field.name) + ")" : field.name;
      field.name = newName; 
      if (field.originalFields.length == 1) {
        field.originalFields[0].name = newName;
      }
    }

  }

  private prepareCorpusData(): void {
    //Keep only selected fields from the previous modal
    for (let corpus of this.data.corpora) {
      corpus['corpusSelections'] = corpus['corpusSelections'].filter((s: any) => s['selected']);
    }

    //Get the distinct field names
    let fieldNames: Set<string> = new Set();
    for (let corpus of this.data.corpora) {
      for (let field of corpus['corpusSelections']) {
        fieldNames.add(field.name);
      }
    }

    if (this.data.combineFields) {
      //The user has selected to automatically combine fields with the same name
      for (let name of fieldNames) {
        let fieldData = {
          name: name,
          type: null,
          originalFields: []
        };
        for (let corpus of this.data.corpora) {
          for (let field of corpus['corpusSelections']) {
            if (field.name == name) {
              fieldData.originalFields.push({
                name: field.name,
                type: field.type,
                corpusName: corpus.corpusName
              });
              fieldData.type = field.type;
            }
          }
        }
        this.mergedFieldsData.fields.push(fieldData);
      }
    } else {
      //All fields are not merged automatically
      for (let corpus of this.data.corpora) {
        for (let field of corpus['corpusSelections']) {
          this.mergedFieldsData.fields.push({
            name: field.name,
            type: field.type,
            originalFields: [{
              name: field.name,
              type: field.type,
              corpusName: corpus.corpusName
            }]
          });
        }
      }
    }
    this.updateFieldNames();

  }

}
