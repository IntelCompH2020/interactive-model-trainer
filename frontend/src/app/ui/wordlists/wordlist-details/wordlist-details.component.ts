import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-wordlist-details',
  templateUrl: './wordlist-details.component.html',
  styleUrls: ['./wordlist-details.component.scss']
})
export class WordlistDetailsComponent implements OnInit {

  words: {}[] = [];

  @ViewChild('button') okButton: any;

  get name() {
    return this.data?.wordlist.name;
  }

  get type() {
    return this.data?.wordlist.type;
  }

  get list(): String[] {
    return this.data?.wordlist.wordlist.map(word => {
      if (word.term) return word.term + " : " + word.equivalence;
      else return word;
    });
  }

  constructor(
    private dialogRef: MatDialogRef<WordlistDetailsComponent>,
    private language: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data
  ) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.okButton._elementRef.nativeElement.focus();
    }, 0);
  }

  close(): void {
    this.dialogRef.close();
  }

}