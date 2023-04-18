import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { AppEnumUtils } from '@app/core/formatting/enum-utils.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-model-parameters-table',
  templateUrl: './model-parameters-table.component.html',
  styleUrls: ['./model-parameters-table.component.scss']
})
export class ModelParametersComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() parameters: ModelParam[] = [];
  @Input() maxParamsPerRow?: number = 6;

  trackByIndex = (index: any, _item: any) => index;
  trackByItem = (_index: number, item: any) => item.name;
  trackByLabel = (_index: number, item: any) => item;

  get paramRows(): ParamRow[] {
    let pages = Math.ceil(this.parameters.length / this.maxParamsPerRow);
    let index = 0;
    let rows: ParamRow[] = [];
    for (let page = 0; page < pages; page++) {
      let row: ParamRow = {
        parameters: []
      }
      for (let i = 0; i < this.maxParamsPerRow; i++) {
        if (index == this.parameters.length) break;
        row.parameters.push(this.parameters[index]);
        index++;
      }
      rows.push(row);
    }
    return rows;
  }

  constructor(
    public enumUtils: AppEnumUtils,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {}

}

interface ParamRow {
  parameters: ModelParam[];
}

export interface ModelParam {
  name: string;
  realName?: string;
  displayName: string;
  placeholder?: string;
  type: string;
  default?: string | number | boolean | string[] | number[];
  tooltip?: string;
  validation?: {
    min?: string | number;
    max?: string | number;
    step?: string | number;
    options?: {
      displayName: string;
      value: string | number | boolean;
    }[];
    rawOptions?: string[] | number[];
  }
}