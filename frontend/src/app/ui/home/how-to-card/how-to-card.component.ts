import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MarkdownDialogComponent } from '@app/ui/markdown-dialog/markdown-dialog.component';
import { type } from 'os';

@Component({
  selector: 'app-how-to-card',
  templateUrl: './how-to-card.component.html',
  styleUrls: ['./how-to-card.component.scss']
})
export class HowToCardComponent implements OnInit {

  @Input()
  config: HowToConfig = null;

  protected expanded: boolean = false;

  get title(): string {
    return this.config?.title;
  }

  get subtitle(): string {
    return this.config?.subtitle;
  }

  get guides(): HowToConfigGuide[] {
    return this.config?.guides;
  }

  constructor(
    protected dialog: MatDialog 
  ) { }

  ngOnInit(): void {
    this.expanded = this.config?.expanded;
  }

  expand(): void {
    this.expanded = !this.expanded;
  }

  showGuide(title: string, source: string): void {
    this.dialog.open(MarkdownDialogComponent, {
      width: "50rem",
      maxWidth: "90vw",
      disableClose: true,
      data: {
        title: "Guide - " + title,
        markdownSource: "/assets/guides/" + source
      }
    });
  }

}

export type HowToConfig = {
  title: string,
  subtitle: string,
  expanded: boolean,
  guides: HowToConfigGuide[]
}

export type HowToConfigGuide = {
  label: string,
  source: string
}
