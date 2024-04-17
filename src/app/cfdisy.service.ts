import { MatDialog } from '@angular/material/dialog';
import { catchError, tap } from 'rxjs/operators';
import { CfdisyDetalleComponent } from './cfdisy-detalle/cfdisy-detalle.component';
import { Injectable } from '@angular/core';
import { BehaviorSubject, find, Observable } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import { FormControl } from '@angular/forms';
import { writeFileXLSX, utils } from 'xlsx';
import { DownloadHelper } from './download-helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpHeaders, HttpClient } from '@angular/common/http';

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
  uuidValid: BehaviorSubject<any[]> = new BehaviorSubject([] as any[]);
  rfc = new FormControl('');
  filtro = new FormControl('');
  tipoRfc = new FormControl({ value: '', disabled: true });
  downloadHelper = new DownloadHelper();
  countXml = 0;

  constructor(
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  showSnack(mess: string, colorClass: string) {
    this._snackBar.open(mess, 'cerrar', {
      duration: 2000,
      panelClass: ['mat-toolbar', colorClass],
    });
  }

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
        if (!uuidxml || uuidxml === uuid) {
          return;
        }
      }
      this.countXml++;
      this.showSnack(
        'Se agregaron ' + this.countXml + ' archivos CFDI',
        'success'
      );
      file['Comprobante']['Total'] =
        Number(file['Comprobante']['Total']) ?? file['Comprobante']?.['Total'];
      this.validateCfdi(file['Comprobante']).subscribe(
        (val: string) => {
          file['Comprobante']['Valid'] = val;
          if (val.includes('<a:Estado>Vigente</a:Estado>')) {
            file['Comprobante']['Status'] = 'success';
          } else {
            file['Comprobante']['Status'] = 'info';
          }
        },
        () => {
          file['Comprobante']['Status'] = 'warning';
          file['Comprobante']['Valid'] = null;
        }
      );
      this.xmlFiles.next([...this.xmlFiles.value, file['Comprobante']]);
      this.addTableData(file['Comprobante']);
    }
  }

  removeAllXmlFiles(): void {
    this.xmlFiles.next([]);
    this.tableData.next([]);
    this.countXml = 0;
    this.showSnack('Se han eliminado todos los cfdi', 'mat-accent');
  }

  removeXmlFile(uuid: string): void {
    this.xmlFiles.next(
      this.xmlFiles.value.filter((val) => this.compareUuid(uuid, val))
    );
    this.tableData.next(
      this.tableData.value.filter((val) => this.compareUuid(uuid, val))
    );
    this.showSnack('Se ha eliminado el cfdi: ' + uuid, 'info');
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
        this.showSnack('Error al leer el archivo' + file.name, 'warning');
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

  detailXmlFile(xml: any): void {
    this.dialog.open(CfdisyDetalleComponent, {
      width: '90vw',
      maxHeight: '98vh',
      data: { xml },
    });
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
    for (let i = 0; i < data['Conceptos']?.['Concepto']?.length; i++) {
      check(data['Conceptos']?.['Concepto']?.[i]?.['Descripcion']);
    }
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

    if (
      fInd < filter.length &&
      (fInd === 0 || filter.slice(fInd + 1).trim() !== '')
    ) {
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

  validateCfdi(xml: any): Observable<string> {
    const targetUrl = 'api/sat';
    const cData = `<![CDATA[?re=${xml['Emisor']?.['Rfc']}&rr=${xml['Receptor']?.['Rfc']}&tt=${xml['Total']}&id=${xml['Complemento']?.['TimbreFiscalDigital']?.['UUID']}]]>`;
    const cuerpo = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:Consulta><!--Optional:--><tem:expresionImpresa>${cData}</tem:expresionImpresa></tem:Consulta></soapenv:Body></soapenv:Envelope>`;
    const headerDict = {
      'content-type': 'text/xml;charset="utf-8"',
      Accept: 'text/xml',
      SOAPAction: 'http://tempuri.org/IConsultaCFDIService/Consulta',
    };
    return this.http.post(targetUrl, cuerpo, {
      headers: new HttpHeaders(headerDict),
      responseType: 'text',
    });
  }
}
