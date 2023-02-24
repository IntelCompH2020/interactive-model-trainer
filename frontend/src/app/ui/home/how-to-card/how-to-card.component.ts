import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-how-to-card',
  templateUrl: './how-to-card.component.html',
  styleUrls: ['./how-to-card.component.scss']
})
export class HowToCardComponent implements OnInit {


  @Input()
  title: string  = '';

  @Input()
  description: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
