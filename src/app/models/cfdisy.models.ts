export interface cfdisyTableModel {
  version: string;
  fecha: Date;
  uuid: string;
  emisorRfc: string;
  receptorRfc: string;
  total: number;
  expand?: any;
}

export interface cfdisyTableExpandModel {
  emisorNombre?: string;
  receptorNombre?: string;
  serie?: string;
  folio?: string;
  impuestoTraslado?: number;
  impuestoRetencion?: number;
  tipoDeComprobante?: string;
  subTotal?: number;
  descuento?: number;
  moneda?: string;
  metodoPago?: string;
  formaPago?: string;
  usoCfdi?: string;
}
