import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Equivalence } from '@app/core/model/equivalence/equivalence.model';
import { Stopword } from '@app/core/model/stopword/stopword.model';
import { EquivalencesListingComponent } from './equivalences-listing/equivalences-listing.component';
import { StopwordsListingComponent } from './stopwords-listing/stopwords-listing.component';

@Component({
  selector: 'app-stopwords-and-equivalences',
  templateUrl: './stopwords-and-equivalences.component.html',
  styleUrls: ['./stopwords-and-equivalences.component.css']
})
export class StopwordsAndEquivalencesComponent implements OnInit {

  @ViewChild('equivalencesListingComponent') equivalencesListingComponent: EquivalencesListingComponent;
  @ViewChild('stopWordsListingComponent') stopWordsListingComponent: StopwordsListingComponent;

  ViewSelection = ViewSelection;

  selectedView = undefined;


  @Output()
  onStopwordSelect = new EventEmitter<Stopword>();

  @Output()
  onEquivalenceSelect = new EventEmitter<Equivalence>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      if (data['wordlistView'] === 'stopwords') {
        this.setSelectedView(ViewSelection.Stopwords);
      } else this.setSelectedView(ViewSelection.equivalences);
    });
  }

  refresh(): void {
    switch (this.selectedView) {
      case ViewSelection.equivalences: {
        this.equivalencesListingComponent?.refresh();
        break;
      }
      case ViewSelection.Stopwords: {
        this.stopWordsListingComponent?.refresh();
        break;
      }
      default: {
        console.error("Selected wordlist view not compatible");
      }
    }
  }

  edit(model: Stopword | Equivalence, updateAll: boolean = false): void {
    switch (this.selectedView) {
      case ViewSelection.equivalences: {
        this.equivalencesListingComponent?.edit(model as Equivalence, updateAll);
        break;
      }
      case ViewSelection.Stopwords: {
        this.stopWordsListingComponent?.edit(model as Stopword, updateAll);
        break;
      }
      default: {
        console.error("Selected wordlist view not compatible");
      }
    }
  }

  copy(model: Stopword | Equivalence): void {
    switch (this.selectedView) {
      case ViewSelection.equivalences: {
        this.equivalencesListingComponent?.copy(model as Equivalence);
        break;
      }
      case ViewSelection.Stopwords: {
        this.stopWordsListingComponent?.copy(model as Stopword);
        break;
      }
      default: {
        console.error("Selected wordlist view not compatible");
      }
    }
  }

  private setSelectedView(viewSelection: ViewSelection) {
    this.onStopwordSelect.emit(null);
    this.onEquivalenceSelect.emit(null);
    this.selectedView = viewSelection;
  }

  goToStopwords(): void {
    this.router.navigateByUrl("/wordlists/stopwords");
  }

  goToEquivalencies(): void {
    this.router.navigateByUrl("/wordlists/equivalences");
  }

  onSelectItem($event: Equivalence | Stopword) {
    if (this.selectedView === ViewSelection.equivalences) {
      this.onEquivalenceSelect.emit($event as Equivalence);
    }
    else this.onStopwordSelect.emit($event as Stopword);
  }

}

enum ViewSelection {
  Stopwords = 'stopwords',
  equivalences = 'equivalences'
}