import { CdkDragDrop, CdkDragStart } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { LogicalCorpusPersist, MergedCorpusField } from "@app/core/model/corpus/logical-corpus.model";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'table[app-merged-corpus-table]',
  templateUrl: './merged-corpus-table.component.html',
  styleUrls: ['./merged-corpus-table.component.scss']
})
export class MergedCorpusTableComponent implements OnInit {

  corpus: LogicalCorpusPersist = {
    name: null, 
    description: null,
    visibility: null, 
    Dtsets: [],
    fields: []
  };

  @Input() corpusSubject: BehaviorSubject<LogicalCorpusPersist>;
  @Output() change = new EventEmitter<MergeEvent>();

  connectedDroplists: string[] = [];
  public currentUnmergeParent: string = '';
  
  ngOnInit(): void {
    this.corpusSubject.subscribe(value => {
      this.corpus = value;
      this.updateDroplists();
    });
  }

  private updateDroplists(): void {
    this.connectedDroplists = [];
    for (let mergedField of this.corpus.fields) {
      this.connectedDroplists.push(this.getDroplistIdFromFieldName(mergedField.name));
    }
  }

  public onFieldMerge(event: CdkDragDrop<MergedCorpusField, MergedCorpusField>) {
    if (event.container.id === "parent") return;

    let item: MergedCorpusField = event.item.data;

    this.change.emit({
      mergeType: MergeEventType.MERGE,
      field: item,
      targetFieldName: this.getFieldNameFromDroplistId(event.container.id)
    });
  }

  public onFieldUnMerge(event: CdkDragDrop<MergedCorpusField, MergedCorpusField>) {
    if (event.container.id === "parent" || !event.container.id.endsWith(this.currentUnmergeParent)) {
      this.onUnmergeDragEnd();
      return;
    }
    this.onUnmergeDragEnd();

    let item: MergedCorpusField = event.item.data;

    this.change.emit({
      mergeType: MergeEventType.UNMERGE,
      field: item,
      targetFieldName: this.getFieldNameFromDroplistId(event.container.id)
    });
  }

  public getDroplistIdFromFieldName(name: string) {
    return "mergeHandle-" + name;
  }

  public getFieldNameFromDroplistId(id: string) {
    return id.replace("mergeHandle-","");
  }

  public onUnmergeDragStart(event: CdkDragStart) {
    let item = event.source.data;
    this.currentUnmergeParent = this.getParentFieldName(item);
  }

  private onUnmergeDragEnd() {
    this.currentUnmergeParent = '';
  }

  private getParentFieldName(child: MergedCorpusField): string {
    for (let field of this.corpus.fields) {
      for(let original of field.originalFields) {
        if (Object.keys(original).every((key) =>  original[key] === child[key])) return field.name;
      }
    };
    return undefined;
  }

}

export enum MergeEventType {
  MERGE = 'MERGE', UNMERGE = 'UNMERGE'
}

export interface MergeEvent {
  mergeType: MergeEventType,
  field: MergedCorpusField,
  targetFieldName: string
}