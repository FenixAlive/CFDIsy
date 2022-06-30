export class DownloadHelper {
  suma: object;
  columnasSuma = [
    'SUBTOTAL',
    'DESCUENTO',
    'SUMA SUBTOTAL',
    'IVA',
    'IEPS',
    'RET-ISR',
    'RET-IVA',
    'RET-IEPS',
    'TOTAL',
    'TOTAL PESOS',
    'TOTAL PAGADO',
  ];

  constructor() {
    this.suma = this.limpiarValores();
  }

  limpiarValores(): object {
    const val = { UUID: 'TOTALES' };
    for (const name of this.columnasSuma) {
      (val as any)[name] = 0;
    }
    return val;
  }

  descargarTodosHelper(xmlFiles: any[]): any[] {
    return xmlFiles.map((row) => this.crearFila(row));
  }

  crearFila(row: any): any {
    const val = {
      VERSION: row['Version'],
      FECHA: row['Fecha']?.split('T')[0] ?? row['Fecha'] ?? '',
      UUID: row['Complemento']?.['TimbreFiscalDigital']?.['UUID'],
      SERIE: row['Serie'] ?? '',
      FOLIO: row['Folio'] ?? '',
      EMISOR: row['Emisor']?.['Rfc'],
      RECEPTOR: row['Receptor']?.['Rfc'],
      'NOMBRE EMISOR': row['Emisor']['Nombre'] ?? '',
      'NOMBRE RECEPTOR': row['Receptor']['Nombre'] ?? '',
      SUBTOTAL: this.checkNumber(row['SubTotal'], 0),
      DESCUENTO: this.checkNumber(row['Descuento'], 0),
      'SUMA SUBTOTAL':
        this.checkNumber(row['SubTotal'], 0) -
        this.checkNumber(row['Descuento'], 0),
      IVA: this.obtenerImpuesto(row, 'Traslados', '002'),
      IEPS: this.obtenerImpuesto(row, 'Traslados', '003'),
      'RET-ISR': this.obtenerImpuesto(row, 'Retenciones', '001'),
      'RET-IVA': this.obtenerImpuesto(row, 'Retenciones', '002'),
      'RET-IEPS': this.obtenerImpuesto(row, 'Retenciones', '003'),
      TOTAL: this.checkNumber(row['Total'], 0),
      MONEDA: row['Moneda'],
      'TIPO DE CAMBIO': this.checkNumber(row['TipoCambio'], 1),
      'TOTAL PESOS': Number(row['Total']) * Number(row['TipoCambio'] ?? 1),
      'TIPO DE COMPROBANTE': row['TipoDeComprobante'],
      'FORMA PAGO': row['FormaPago'] ?? '',
      'METODO PAGO': row['MetodoPago'] ?? '',
      'TOTAL PAGADO': this.revisarTotalPagado(row),
    };
    for (const titulo of this.columnasSuma) {
      (this.suma as any)[titulo] += (val as any)[titulo];
    }
    return val;
  }

  //crearSumas()

  checkNumber(data: string, def: number): number {
    if (!data) {
      return def;
    }
    if (!isNaN(Number(data))) {
      return Number(data);
    }
    return Number(data);
  }

  obtenerImpuesto(xml: any, tipo: string, cual: string): number {
    let single = tipo.substring(0, tipo.length - 1);
    if (tipo === 'Traslados') {
      single = 'Traslado';
    } else if (tipo === 'Retenciones') {
      single = 'Retencion';
    }
    let suma = 0;

    if (xml['Impuestos']?.[tipo]?.[single] instanceof Array) {
      for (const imp of xml['Impuestos'][tipo][single]) {
        if (imp['Impuesto'] === cual) {
          suma += Number(imp['Importe']);
        }
      }
    } else if (xml['Impuestos']?.[tipo]?.[single]?.['Impuesto'] === cual) {
      suma = Number(xml['Impuestos']?.[tipo][single]['Importe']);
    }
    return suma;
  }

  revisarTotalPagado(xml: any): number {
    let sum = 0;
    if (xml['TipoDeComprobante'] === 'I' && xml['MetodoPago'] === 'PUE') {
      sum = Number(xml['Total']) * Number(xml['TipoCambio'] ?? 1);
    } else if (xml['TipoDeComprobante'] === 'P') {
      if (xml['Complemento']?.['Pagos']?.['Pago'] instanceof Array) {
        for (const pago of xml['Complemento']['Pagos']['Pago']) {
          sum += Number(pago['Monto']);
        }
      } else {
        sum = Number(xml['Complemento']?.['Pagos']?.['Pago']?.['Monto'] ?? 0);
      }
    }
    return sum;
  }

  agregaPie(xmls: any[]): void {
    xmls.push([]);
    xmls.push(this.suma);
    xmls.push([]);
    xmls.push({
      UUID: 'Subtotal con IEPS',
      SUBTOTAL: (this.suma as any)['SUBTOTAL'] + (this.suma as any)['IEPS'],
    });
    xmls.push([]);
    xmls.push({
      UUID: 'Subtotal del IVA',
      IVA: (this.suma as any)['IVA'] / 1.16,
    });
    this.suma = this.limpiarValores();
  }
}
