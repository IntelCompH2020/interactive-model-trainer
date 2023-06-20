import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CorpusValidFor } from "@app/core/enum/corpus-valid-for.enum";
import { TranslateService } from "@ngx-translate/core";
import { CorpusType } from "../corpus.component";
import { LogicalCorpus } from "@app/core/model/corpus/logical-corpus.model";
import { RawCorpus } from "@app/core/model/corpus/raw-corpus.model";

@Component({
  selector: 'app-corpus-details',
  templateUrl: './corpus-details.component.html',
  styleUrls: ['./corpus-details.component.scss']
})
export class CorpusDetailsComponent implements OnInit {

  get corpus() {
    if (this.isLogicalCorpus) return this.data?.corpus as LogicalCorpus;
    else return this.data?.corpus as RawCorpus;
  }
  
  get name() {
    return this.corpus.name;
  }

  get type(): CorpusType {
    return this.data?.type;
  }

  get isLogicalCorpus(): boolean {
    return this.type === CorpusType.Logical;
  }

  constructor(
    private dialogRef: MatDialogRef<CorpusDetailsComponent>,
    private language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {

  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

}