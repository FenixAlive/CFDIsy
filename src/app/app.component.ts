import { debounceTime } from 'rxjs';
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
    this.cfdisyService.descargarCsvFiltros();
  }

  descargarCsvTodos(): void {
    this.cfdisyService.descargarCsvTodos();
  }
}
