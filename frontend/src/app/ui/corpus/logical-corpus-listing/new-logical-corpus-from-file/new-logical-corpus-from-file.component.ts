import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef} from '@angular/material/dialog';
import { CorpusVisibility } from '@app/core/enum/corpus-visibility.enum';
import { LogicalCorpus } from '@app/core/model/corpus/logical-corpus.model';
import { LogicalCorpusService } from '@app/core/services/http/logical-corpus.service';
import { nameof } from 'ts-simple-nameof';
import { LogicalCorpusEditorModel } from '../logical-corpus-editor.model';

@Component({
  selector: 'app-new-logical-corpus-from-file',
  templateUrl: './new-logical-corpus-from-file.component.html',
  styleUrls: ['./new-logical-corpus-from-file.component.scss']
})
export class NewLogicalCorpusFromFileComponent implements OnInit {

  formGroup: FormGroup;
  editorModel: LogicalCorpusEditorModel;

  file: {
    name?: string,
    contents?: string
  } = {}

  datasets: {
    source: string,
    lemmasfld: string[]
  }[] = [];

  get isPrivate(): boolean{
    return !!(this.formGroup?.get(nameof<LogicalCorpus>(x => x.visibility))?.value === CorpusVisibility.Private );
  }

  get valid() {
    return this.formGroup?.valid;
  }

  constructor(
   private dialogRef: MatDialogRef<NewLogicalCorpusFromFileComponent>,
   private formBuilder: FormBuilder,
   private corpusService: LogicalCorpusService
  ) { 
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      visibility: [false]
    });
  }

  ngOnInit(): void {}

  onPrivateChange(change: MatCheckboxChange): void{
    this.formGroup.get(nameof<LogicalCorpus>(x => x.visibility))
    .patchValue(
      change.checked ? 
        CorpusVisibility.Private
        :
        CorpusVisibility.Public
    );
  }

  onFileSelected(files: FileList) {
    this.file.name = files.item(0).name;
    this.formGroup.patchValue({name: this.getNameFromFileName(files.item(0).name)})
    let reader: FileReader = new FileReader();
    reader.onloadend = (_ev => {
      this.file.contents = reader.result.toString();
      this.updateDatasets();
    })
    reader.readAsText(files[0]);
  }

  getNameFromFileName(fileName: string) {
    return fileName ? fileName.substring(0, fileName.lastIndexOf('.')) : "";
  }

  private getCorpusData(): any {
    let content = JSON.parse(this.file.contents);
    return Object.assign(
      {}, content, {visibility: this.formGroup.value.visibility}
    );
  }

  private updateDatasets(): void {
    let content = JSON.parse(this.file.contents);
    this.datasets = content["Dtsets"] || [];
  }
  
  submit(): void{
    this.corpusService.create(this.getCorpusData()).subscribe(
      _response => {
        this.dialogRef.close(true);
      }
    )
  }

  close(): void{
    this.dialogRef.close();
  }

}