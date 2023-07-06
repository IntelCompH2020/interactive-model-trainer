import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-markdown-dialog',
  templateUrl: './markdown-dialog.component.html',
  styleUrls: ['./markdown-dialog.component.scss']
})
export class MarkdownDialogComponent implements OnInit {

  get title(): string {
    return this.data['title'];
  }

  get source(): string {
    return this.data['markdownSource'];
  }

  loading: boolean = true;
  markdown: string = "";

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<MarkdownDialogComponent>,
    protected language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    this.http.get(this.source, { responseType: 'text' }).subscribe((contents) => {
      this.markdown = contents;
      this.loading = false;
    }, (error) => {
      console.error(error);
      this.loading = false;
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

}