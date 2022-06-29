import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import { FormControl } from '@angular/forms';
import { writeFileXLSX, utils } from 'xlsx';
import { DownloadHelper } from './download-helper';

@Injectable({
  providedIn: 'root',
})
export class CfdisyService {
  parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    removeNSPrefix: true,
    processEntities: false,
  });

  xmlFiles: BehaviorSubject<any[]> = new BehaviorSubject([] as any[]);
  tableData: BehaviorSubject<any[]> = new BehaviorSubject([] as any[]);
  rfc = new FormControl('');
  filtro = new FormControl('');
  tipoRfc = new FormControl({ value: '', disabled: true });
  downloadHelper = new DownloadHelper();

  addXmlFile(file: any): void {
    if (file['Comprobante']) {
      const uuid = (
        file['Comprobante']?.['Complemento']?.['TimbreFiscalDigital']?.[
          'UUID'
        ] as string
      ).toUpperCase();
      for (const xml of this.xmlFiles.value) {
        const uuidxml = (
          xml['Complemento']?.['TimbreFiscalDigital']?.['UUID'] as string
        ).toUpperCase();
        if (uuidxml === uuid) {
          return;
        }
      }
      this.xmlFiles.next([...this.xmlFiles.value, file['Comprobante']]);
      this.addTableData(file['Comprobante']);
    }
  }

  removeAllXmlFiles(): void {
    this.xmlFiles.next([]);
    this.tableData.next([]);
  }

  removeXmlFile(uuid: string): void {
    this.xmlFiles.next(
      this.xmlFiles.value.filter((val) => this.compareUuid(uuid, val))
    );
    this.tableData.next(
      this.tableData.value.filter((val) => this.compareUuid(uuid, val))
    );
  }

  compareUuid(uuid: string, xml: any): boolean {
    return uuid !== xml['Complemento']?.['TimbreFiscalDigital']?.['UUID'];
  }

  addTableData(xml: any): void {
    if (this.checkRfc(this.tipoRfc.value, xml)) {
      this.tableData.next([...this.tableData.value, xml]);
    }
  }

  checkFile(file: File): void {
    if (file?.type === 'text/xml') {
      this.readAndParseFile(file);
    }
  }

  filtrarRfc() {
    if (this.tipoRfc.value === '') {
      this.tableData.next(this.xmlFiles.value);
      return;
    }
    this.tableData.next([]);
    for (const xml of this.xmlFiles.value) {
      this.addTableData(xml);
    }
  }

  checkRfc(check: string, xml: any): boolean {
    if (!check || check === '') {
      return true;
    }
    if (check === 'todos') {
      return this.checkRfc('Emisor', xml) || this.checkRfc('Receptor', xml);
    }
    if (
      xml[check]?.['Rfc'] &&
      (xml[check]?.['Rfc'] as string)
        .toUpperCase()
        .includes(this.rfc.value.toUpperCase())
    ) {
      return true;
    }
    return false;
  }

  readAndParseFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e?.target?.result === 'string') {
        const parsed = this.parser.parse(e?.target?.result as string);
        this.addXmlFile(parsed);
      } else {
        console.error('Error al leer el archivo ' + file.name);
      }
    };
    reader.readAsText(file);
  }

  reviewRfc() {
    if (this.rfc.value !== '') {
      if (this.rfc.value.includes('-')) {
        this.rfc.setValue(this.rfc.value.replace('-', ''));
      }
      if (this.rfc.value.trim() !== this.rfc.value.toUpperCase()) {
        this.rfc.setValue(this.rfc.value.trim().toUpperCase());
      }
      this.tipoRfc.enable();
      this.tipoRfc.setValue('todos');
    } else {
      this.tipoRfc.setValue('');
      this.tipoRfc.disable();
    }
  }

  detalleXmlFile(uuid: string): void {
    console.log(uuid);
  }

  filtrarData(data: any, filter: string): boolean {
    const version = data['Version'];
    const fecha = data['Fecha'];
    const uuid = data['Complemento']?.['TimbreFiscalDigital']?.['UUID'];
    const folio = data['Folio'];
    const emisor = data['Emisor']?.['Rfc'];
    const receptor = data['Receptor']?.['Rfc'];
    const total = data['Total'];

    return `${version} ${fecha} ${uuid} ${folio} ${emisor} ${receptor} ${total}`
      .toUpperCase()
      .includes(filter.toUpperCase());
  }
  descargarCsvTodos(): void {
    const xmls = this.xmlFiles.value.map((row) =>
      this.downloadHelper.crearFila(row)
    );
    xmls.push([]);
    xmls.push(this.downloadHelper.suma);
    this.downloadHelper.suma = this.downloadHelper.limpiarValores();
    const worksheet = utils.json_to_sheet(xmls);
    const workbook = utils.book_new();
    const date = new Date();
    utils.book_append_sheet(workbook, worksheet, 'Todos');
    writeFileXLSX(
      workbook,
      `CFDIsy_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}.xlsx`
    );
  }
}
