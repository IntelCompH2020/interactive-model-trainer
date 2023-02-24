import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { EquivalenciesListingComponent } from './equivalencies-listing/equivalencies-listing.component';
import { StopwordsListingComponent } from './stopwords-listing/stopwords-listing.component';

@Component({
  selector: 'app-stopwords-and-equivalencies',
  templateUrl: './stopwords-and-equivalencies.component.html',
  styleUrls: ['./stopwords-and-equivalencies.component.css']
})
export class StopwordsAndEquivalenciesComponent implements OnInit {

  @ViewChild('equivalenciesListingComponent') equivalenciesListingComponent: EquivalenciesListingComponent;
  @ViewChild('stopWordsListingComponent') stopWordsListingComponent: StopwordsListingComponent;

  ViewSelection = ViewSelection;

  selectedView = ViewSelection.Stopwords;


  @Output()
  onStopwordSelect = new EventEmitter<Stopword>();

  @Output()
  onEquivalenceSelect = new EventEmitter<Equivalence>();

  constructor() { }

  ngOnInit(): void {
  }

  refresh(): void{
    switch(this.selectedView){
      case ViewSelection.Equivalencies :{
        this.equivalenciesListingComponent?.refresh();
        break;
      }
      case ViewSelection.Stopwords:{
        this.stopWordsListingComponent?.refresh();
        break;
      }
      default:{

      }
    }
  }

  edit(model: Stopword | Equivalence): void{
    switch(this.selectedView){
      case ViewSelection.Equivalencies :{
        this.equivalenciesListingComponent?.edit(model as Equivalence);
        break;
      }
      case ViewSelection.Stopwords :{
        this.stopWordsListingComponent?.edit(model as Stopword);
        break;
      }
      default:{

      }
    }
  }


  setSelectedView(viewSelection: ViewSelection){
    this.onStopwordSelect.emit(null);
    this.onEquivalenceSelect.emit(null);
    this.selectedView = viewSelection;
  }

  onSelectItem($event: Equivalence | Stopword){
    if(this.selectedView === ViewSelection.Equivalencies){
      this.onEquivalenceSelect.emit($event as Equivalence);
      return;
    }
    this.onStopwordSelect.emit($event as Stopword);
  }

}



enum ViewSelection{
  Stopwords = 'stopwords',
  Equivalencies = 'equivalencies'
}