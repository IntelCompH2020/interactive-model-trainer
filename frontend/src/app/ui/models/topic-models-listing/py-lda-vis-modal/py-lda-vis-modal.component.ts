import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TopicModelService } from "@app/core/services/http/topic-model.service";

@Component({
  selector: 'app-py-lda-vis-modal',
  templateUrl: './py-lda-vis-modal.component.html',
  styleUrls: ['./py-lda-vis-modal.component.scss']
})
export class PyLDAComponent implements OnInit {

  private _url: string;
  
  get name() {
    return this.data?.name;
  }

  get parentName() {
    return this.data?.parentName;
  }

  get url() {
    return this._url || "";
  }

  constructor(
    private dialogRef: MatDialogRef<PyLDAComponent>,
    private modelService: TopicModelService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {}

  ngOnInit(): void {
    if (this.parentName) {
      this.modelService.pyLDAvisHierarchicalUrl(this.parentName, this.name).subscribe(response => {
        this._url = response;
      });
    } else {
      this.modelService.pyLDAvisUrl(this.name).subscribe(response => {
        this._url = response;
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}