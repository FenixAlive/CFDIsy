import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cfdisy-validate',
  templateUrl: './cfdisy-validate.component.html',
  styleUrls: ['./cfdisy-validate.component.scss'],
})
export class CfdisyValidateComponent {
  @Input() xml: any;
}
