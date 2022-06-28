import { CfdisyService } from './cfdisy.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class AppComponent implements OnInit {
  title = 'CFDIsy';
  fileNames: FormControl = new FormControl(null, Validators.required);

  constructor(public cfdisyService: CfdisyService) {}

  ngOnInit(): void {
    this.cfdisyService.tableData.subscribe(() => {
      if (this.cfdisyService.tableData.value.length > 0) {
        this.fileNames.setValue('true');
      } else {
        this.fileNames.reset(null);
      }
    });
    this.cfdisyService.rfc.valueChanges.subscribe(() => {
      this.cfdisyService.reviewRfc();
    });
    this.cfdisyService.tipoRfc.valueChanges.subscribe(() => {
      this.cfdisyService.filtrarRfc();
    });
  }

  onFileSelected(event: any): void {
    const tempFile = event?.target?.files;
    for (let i = 0; i < tempFile.length; i++) {
      this.cfdisyService.checkFile(tempFile[i]);
    }
    event.target.value = '';
  }

  limpiarFiles(): void {
    this.cfdisyService.removeAllXmlFiles();
  }

  descargarCsvFiltros(): void {
    console.log(this.cfdisyService.rfc.value);
  }

  descargarCsvTodos(): void {
    console.log(this.cfdisyService.xmlFiles.value);
  }
}
