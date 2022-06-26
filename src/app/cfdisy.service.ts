import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cfdisyTableModel } from './models/cfdisy.models';
import { XMLParser } from 'fast-xml-parser';

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
  tableData: BehaviorSubject<cfdisyTableModel[]> = new BehaviorSubject(
    [] as cfdisyTableModel[]
  );

  addXmlFile(file: any): void {
    if (file['Comprobante']) {
      const uuid =
        file['Comprobante']?.['Complemento']?.['TimbreFiscalDigital']?.['UUID'];
      this.tableData.value.forEach((xml) => {
        if (xml['uuid'] === uuid) {
          return;
        }
      });
      this.xmlFiles.next([...this.xmlFiles.value, file['Comprobante']]);
      this.addTableData(file['Comprobante']);
    }
  }

  removeAllXmlFiles(): void {
    this.xmlFiles.next([]);
    this.tableData.next([]);
  }

  removeXmlFile(uuid: string): void {
    //const index = this.tableData.value.findIndex((el) => el['uuid'] === uuid);
    this.tableData.next(
      this.tableData.value.filter((val) => val['uuid'] !== uuid)
    );
    this.xmlFiles.next(
      this.xmlFiles.value.filter((val) => {
        return uuid !== val['Complemento']?.['TimbreFiscalDigital']?.['UUID'];
      })
    );
    console.log(this.xmlFiles.value);
  }

  addTableData(xml: any): void {
    const version = xml['Version'];
    let fecha;
    let uuid = '';
    let emisorRfc = '';
    let receptorRfc = '';
    let total;
    const expand = xml;
    if (version === '3.3' || version === '4.0') {
      uuid = xml['Complemento']?.['TimbreFiscalDigital']?.['UUID'];
      fecha = new Date(xml['Fecha']);
      emisorRfc = xml['Emisor']?.['Rfc'];
      receptorRfc = xml['Receptor']?.['Rfc'];
      total = Number(xml['Total'] | 0);
    }
    this.tableData.next([
      ...this.tableData.value,
      {
        version,
        fecha,
        uuid,
        emisorRfc,
        receptorRfc,
        total,
        expand,
      } as cfdisyTableModel,
    ]);
  }

  checkFile(file: File): void {
    if (file?.type === 'text/xml') {
      this.readAndParseFile(file);
    }
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
    reader.readAsText(file, 'UTF-8');
  }
}
