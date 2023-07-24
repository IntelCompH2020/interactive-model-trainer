import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { LocalDataset, LogicalCorpusPersist } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { BaseComponent } from '@common/base/base.component';
import { LogicalCorpusEditorModel } from '../../logical-corpus-editor.model';

@Component({
  selector: 'app-merge-logical-corpus',
  templateUrl: './merge-logical-corpus.component.html',
  styleUrls: ['./merge-logical-corpus.component.scss']
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

  mergedFieldsData: LogicalCorpusPersist = {
    name: null,
    description: null,
    visibility: CorpusVisibility.Public,
    valid_for: null,
    fields: [],
    Dtsets: []
  };

  ngOnInit(): void {
    this.prepareCorpusData();
    this.setCorpusData();
  }

  private setCorpusData(): void {
    this.mergedFieldsData.name = this.data.name;
    this.mergedFieldsData.description = this.data.description;
    this.mergedFieldsData.visibility = this.data.visibility;
    this.mergedFieldsData.valid_for = this.data.validFor;
    let datasets: LocalDataset[] = [];
    for (let field of this.data.corpora) {
      let texts: string[] = [];
      let lemmas: string[] = [];
      let dataset: LocalDataset = {
        source: field.corpusSource,
        filter: ""
      }
      for (let item of field.corpusSelections) {
        if (item.type === "id") dataset.idfld = item.name;
        else if (item.type === "title") dataset.titlefld = item.name;
        else if (item.type === "text") texts.push(item.name);
        else if (item.type === "lemmas") lemmas.push(item.name);
        else if (item.type === "embeddings") dataset.embeddingsfld = item.name;
        else if (item.type === "category") dataset.categoryfld = item.name;
      }
      dataset.textfld = texts;
      dataset.lemmasfld = lemmas;
      datasets.push(dataset);
    }
    this.mergedFieldsData.Dtsets = datasets;
  }

  merge(): void {
    this.logicalCorpusService.create(this.mergedFieldsData).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private prepareCorpusData(): void {
    //Keep only selected fields from the previous modal
    for (let corpus of this.data.corpora) {
      corpus['corpusSelections'] = corpus['corpusSelections'].filter((s: any) => s['selected'] && s['type']);
    }
  }

}
