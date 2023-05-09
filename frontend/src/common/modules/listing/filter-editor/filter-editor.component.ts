import { Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filter-editor',
  templateUrl: './filter-editor.component.html',
  styleUrls: ['./filter-editor.component.scss']
})
export class FilterEditorComponent implements OnInit {


  FilterEditorFilterType = FilterEditorFilterType;

  @Input()
  filterFormGroup: FormGroup; 

  @Input()
  config: FilterEditorConfiguration ;


  constructor() { 
  }

  ngOnInit(): void {
  }

  clear(item: string): void {
    this.filterFormGroup.get(item).reset();
  }

}

export interface FilterEditorConfiguration{
  items: FilterEditorConfigurationItem[];
}


export interface FilterEditorConfigurationItem{
  key: string;
  type: FilterEditorFilterType,
  placeholder?: string;
  label?: string;
  availableValues?: {
    label: () => string;
    value: any;
  }[];
}

export enum FilterEditorFilterType{
  DatePicker = 'datepicker',
  Checkbox = 'checkbox',
  Select = 'select',
  TextInput = 'text_input'
}