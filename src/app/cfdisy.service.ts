import { Injectable } from '@angular/core';
import { BehaviorSubject, find } from 'rxjs';
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
    if (!filter || filter === '') {
      return true;
    }
    filter = filter.toUpperCase();
    let tempStr = '';
    const check = (val: string | null): void => {
      if (val && val != '') {
        tempStr += val;
      }
    };
    check(data['Version']);
    check(data['Fecha']);
    check(data['Complemento']?.['TimbreFiscalDigital']?.['UUID']);
    check(data['Folio']);
    check(data['Emisor']?.['Rfc']);
    check(data['Emisor']?.['Nombre']);
    check(data['Receptor']?.['Rfc']);
    check(data['Receptor']?.['Nombre']);
    check(data['Total']);
    tempStr = tempStr.toUpperCase();
    let fInd = 0;
    let result = false;
    for (let i = 0; i < filter.length; i++) {
      if (filter[i] === '|' || filter[i] === '&') {
        if (fInd === 0) {
          result = tempStr.includes(filter.slice(fInd, i).trim());
        } else if (filter[fInd] === '|') {
          result = result || tempStr.includes(filter.slice(fInd + 1, i).trim());
        } else {
          result = result && tempStr.includes(filter.slice(fInd + 1, i).trim());
        }
        fInd = i;
      }
    }
    if (fInd < filter.length && filter.slice(fInd + 1).trim() !== '') {
      if (fInd === 0) {
        result = tempStr.includes(filter.slice(fInd).trim());
      } else if (filter[fInd] === '|') {
        result = result || tempStr.includes(filter.slice(fInd + 1).trim());
      } else {
        result = result && tempStr.includes(filter.slice(fInd + 1).trim());
      }
    }
    return result;
  }

  descargarCsvTodos(): void {
    const xmls = this.xmlFiles.value.map((row) =>
      this.downloadHelper.crearFila(row)
    );
    this.downloadHelper.agregaPie(xmls);
    this.descargarXlsx(xmls, 'todos');
  }

  descargarCsvFiltros(): void {
    const xmls = this.tableData.value
      .filter((data) => {
        return this.filtrarData(data, this.filtro.value);
      })
      .map((row) => this.downloadHelper.crearFila(row));
    this.downloadHelper.agregaPie(xmls);
    this.descargarXlsx(
      xmls,
      `${this.filtro.value}_${this.rfc.value}_${this.tipoRfc.value}`
    );
  }

  descargarXlsx(xmls: any, name: string): void {
    const worksheet = utils.json_to_sheet(xmls);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Todos');
    const date = new Date();
    writeFileXLSX(
      workbook,
      `CFDIsy_${name}_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}.xlsx`
    );
  }

  tempFilterSearch(filter: string, tempStr: string): boolean {
    let fInd = 0;
    let result = false;
    for (let i = 0; i < filter.length; i++) {
      if (filter[i] === '|' || filter[i] === '&') {
        if (fInd === 0) {
          result = filter[i] === '|' ? false : true;
          break;
        }
        if (filter[fInd] === '|') {
          result = result || filter.slice(fInd, i).includes(tempStr);
        } else {
          result = result && filter.slice(fInd, i).includes(tempStr);
        }
        fInd = i + 1;
      }
    }
    if (fInd < filter.length) {
      if (filter[fInd] === '|') {
        result = result || filter.slice(fInd, filter.length).includes(tempStr);
      } else {
        result = result && filter.slice(fInd, filter.length).includes(tempStr);
      }
    }
    return result;
  }
}
