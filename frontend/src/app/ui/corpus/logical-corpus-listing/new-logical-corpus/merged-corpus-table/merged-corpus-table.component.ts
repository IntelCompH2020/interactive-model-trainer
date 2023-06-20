import { Component, Input, OnInit } from "@angular/core";
import { LocalDataset } from "@app/core/model/corpus/logical-corpus.model";

@Component({
  selector: 'table[app-merged-corpus-table]',
  templateUrl: './merged-corpus-table.component.html',
  styleUrls: ['./merged-corpus-table.component.scss']
})
export class MergedCorpusTableComponent implements OnInit {

  @Input() dataset: LocalDataset;
  
  ngOnInit(): void {}

}