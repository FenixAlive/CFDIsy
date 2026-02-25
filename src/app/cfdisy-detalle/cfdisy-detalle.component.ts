import {
  Component,
  OnInit,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import regimenFiscal from '../../assets/catalogs/regimen_fiscal.json';
import usoCfdi from '../../assets/catalogs/uso_cfdi.json';
import formaPago from '../../assets/catalogs/forma_pago.json';
import metodoPago from '../../assets/catalogs/metodo_pago.json';
import objetoImpuesto from '../../assets/catalogs/objeto_impuesto.json';
import exportacion from '../../assets/catalogs/exportacion.json';
import impuesto from '../../assets/catalogs/impuesto.json';
import tipoComprobante from '../../assets/catalogs/tipo_comprobante.json';
import periodicidad from '../../assets/catalogs/periodicidad.json';
import meses from '../../assets/catalogs/meses.json';
import claveProdServ from '../../assets/catalogs/clave_prod_serv.json';

@Component({
  selector: 'app-cfdisy-detalle',
  templateUrl: './cfdisy-detalle.component.html',
  styleUrls: ['./cfdisy-detalle.component.scss'],
})
export class CfdisyDetalleComponent implements OnInit {
  xml: any;

  regimenFiscalMap: any = regimenFiscal;
  usoCfdiMap: any = usoCfdi;
  formaPagoMap: any = formaPago;
  metodoPagoMap: any = metodoPago;
  objetoImpuestoMap: any = objetoImpuesto;
  exportacionMap: any = exportacion;
  impuestoMap: any = impuesto;
  tipoComprobanteMap: any = tipoComprobante;
  periodicidadMap: any = periodicidad;
  mesesMap: any = meses;
  claveProdServMap: any = claveProdServ;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CfdisyDetalleComponent>
  ) {
    this.xml = data?.xml || data;
  }

  toArray(val: any): any[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  ngOnInit(): void {
    console.log('CFDI Data:', this.xml);
  }

  close(): void {
    this.dialogRef.close();
  }

  get subtotalNeto(): number {
    const subTotal = parseFloat(this.xml?.SubTotal) || 0;
    const descuento = parseFloat(this.xml?.Descuento) || 0;
    return subTotal - descuento;
  }

  get totalPesos(): number {
    const total = parseFloat(this.xml?.Total) || 0;
    const tipoCambio = parseFloat(this.xml?.TipoCambio) || 1;
    return total * tipoCambio;
  }

  get cfdiRelacionados(): any[] {
    const relacionados = this.xml?.CfdiRelacionados;
    if (!relacionados) return [];
    return Array.isArray(relacionados) ? relacionados : [relacionados];
  }

  getRelatedUUIDs(relGroup: any): any[] {
    const docs = relGroup?.CfdiRelacionado;
    if (!docs) return [];
    return Array.isArray(docs) ? docs : [docs];
  }

  get conceptos(): any[] {
    const conceptos = this.xml?.Conceptos?.Concepto;
    if (!conceptos) return [];
    return Array.isArray(conceptos) ? conceptos : [conceptos];
  }

  getImpuestosConcepto(concepto: any): any {
    const traslados = concepto?.Impuestos?.Traslados?.Traslado;
    const retenciones = concepto?.Impuestos?.Retenciones?.Retencion;

    return {
      traslados: traslados ? (Array.isArray(traslados) ? traslados : [traslados]) : [],
      retenciones: retenciones ? (Array.isArray(retenciones) ? retenciones : [retenciones]) : []
    };
  }

  get pagos(): any[] {
    const pagos = this.xml?.Complemento?.Pagos?.Pago;
    if (!pagos) return [];
    return Array.isArray(pagos) ? pagos : [pagos];
  }

  getDocsRelacionados(pago: any): any[] {
    const docs = pago?.DoctoRelacionado;
    if (!docs) return [];
    return Array.isArray(docs) ? docs : [docs];
  }

  getImpuestosPago(pago: any): any {
    const traslados = pago?.ImpuestosP?.TrasladosP?.TrasladoP;
    const retenciones = pago?.ImpuestosP?.RetencionesP?.RetencionP;

    return {
      traslados: traslados ? (Array.isArray(traslados) ? traslados : [traslados]) : [],
      retenciones: retenciones ? (Array.isArray(retenciones) ? retenciones : [retenciones]) : []
    };
  }
}
