import {
  Component,
  OnInit,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cfdisy-detalle',
  templateUrl: './cfdisy-detalle.component.html',
  styleUrls: ['./cfdisy-detalle.component.scss'],
})
export class CfdisyDetalleComponent implements OnInit {
  xml: any;
  preXml = ''

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    if (this.data?.['xml']) {
      this.xml = this.data?.['xml'];

      // Normalize Conceptos to be an array
      if (this.xml.Conceptos && this.xml.Conceptos.Concepto) {
        this.xml.Conceptos = Array.isArray(this.xml.Conceptos.Concepto)
          ? this.xml.Conceptos.Concepto
          : [this.xml.Conceptos.Concepto];
      } else {
        this.xml.Conceptos = [];
      }

      // Normalize Impuestos.Traslados to be an array
      if (this.xml.Impuestos && this.xml.Impuestos.Traslados && this.xml.Impuestos.Traslados.Traslado) {
        this.xml.Impuestos.Traslados = Array.isArray(this.xml.Impuestos.Traslados.Traslado)
            ? this.xml.Impuestos.Traslados.Traslado
            : [this.xml.Impuestos.Traslados.Traslado];
      } else if (this.xml.Impuestos) {
          this.xml.Impuestos.Traslados = [];
      }

    }
  }
}
