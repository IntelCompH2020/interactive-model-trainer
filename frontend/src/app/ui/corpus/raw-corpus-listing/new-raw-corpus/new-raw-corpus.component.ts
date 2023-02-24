import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import { RawCorpusService } from '@app/core/services/http/raw-corpus.service';
import { RawCorpusEditorModel } from './raw-corpus-editor.model';

@Component({
  selector: 'app-new-raw-corpus',
  templateUrl: './new-raw-corpus.component.html',
  styleUrls: ['./new-raw-corpus.component.scss']
})
export class NewRawCorpusComponent implements OnInit {

  get fieldsArray(): FormArray{
    return this.formGroup?.get('fields') as FormArray;
  }
  formGroup: FormGroup;
  editorModel: RawCorpusEditorModel;

  file: {
    name?: string,
    contents?: string
  } = {}

  corpusConfig: {
    name: string,
    fields: {
      name: string,
      type: string,
      selected?: boolean
    }[]
  } = {
    name: null,
    fields: []
  }

  constructor(
   private dialogRef: MatDialogRef<NewRawCorpusComponent>,
   private rawCorpusService: RawCorpusService
  ) {
    this.prepareCorpusData();
   }

  ngOnInit(): void {}

  private prepareCorpusData() {
    if (this.file.contents) this.corpusConfig = JSON.parse(this.file.contents);
    this.editorModel = new RawCorpusEditorModel().fromModel({
      name: this.corpusConfig.name,
      fields: this.corpusConfig.fields
    } as any);
    this.formGroup = this.editorModel.buildForm();
  }

  onFieldSelection(checked: boolean) {
    
  }

  onFileSelected(files: FileList) {
    this.file.name = files.item(0).name;
    this.formGroup.patchValue({name: this.getNameFromFileName(files.item(0).name)})
    let reader: FileReader = new FileReader();
    reader.onloadend = (_ev => {
      this.file.contents = reader.result.toString();
      this.prepareCorpusData();
    })
    reader.readAsText(files[0]);
  }

  getNameFromFileName(fileName: string) {
    return fileName ? fileName.substring(0, fileName.lastIndexOf('.')) : "";
  }

  getCorpusData(): any {
    let selected = this.formGroup.value['fields'].filter((s: any) => s['selected']);
    let fields = selected.map((s: any) => {
      return {name: s['name'], type: s['type']}
    });
    return {...this.formGroup.value, fields};
  }

  upload(): void{
    // let data = this.getCorpusData();

    // this.rawCorpusService.create(data).subscribe(
    //   response => {
    //     this.dialogRef.close(true);
    //   }
    // )
  }

  close(): void{
    this.dialogRef.close();
  }

}