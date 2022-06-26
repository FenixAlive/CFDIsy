import { CfdisyService } from './../cfdisy.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-cfdisy-table',
  templateUrl: './cfdisy-table.component.html',
  styleUrls: ['./cfdisy-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CfdisyTableComponent implements OnInit {
  columnsToDisplay = [
    'version',
    'fecha',
    'uuid',
    'emisorRfc',
    'receptorRfc',
    'total',
    'eliminar',
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: any | null;

  dataSource: any[] = [];
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(private cfdisyService: CfdisyService) {}

  ngOnInit(): void {
    this.cfdisyService.tableData.subscribe((val) => {
      this.dataSource = val;
    });
  }

  deleteXmlFile(uuid: string): boolean {
    this.cfdisyService.removeXmlFile(uuid);
    return false;
  }
}
