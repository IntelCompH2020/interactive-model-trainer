import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.css']
})
export class OverviewCardComponent implements OnInit {
  @Input()
  matIconName: string;

  @Input()
  title: string;

  @Input()
  description: string;

  @Input()
  iconText?: string;


  constructor() { }

  ngOnInit(): void {
  }

}
