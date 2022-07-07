import { CfdisyService } from './../cfdisy.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
    'fecha',
    'uuid',
    'folio',
    'emisorRfc',
    'receptorRfc',
    'total',
    'detalle',
    'eliminar',
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;

  constructor(private cfdisyService: CfdisyService) {}

  ngOnInit(): void {
    this.cfdisyService.tableData.pipe(debounceTime(100)).subscribe((val) => {
      this.dataSource = new MatTableDataSource(val);
      this.dataSource.filter = this.cfdisyService.filtro.value;
      this.dataSource.filterPredicate = this.cfdisyService.filtrarData;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;
      this.dataSource.sortingDataAccessor = (
        data: any,
        sortHeaderId: string
      ): string => {
        return sortHeaderId
          .split('.')
          .reduce((acc, key) => acc && acc[key], data);
      };
    });
    this.cfdisyService.filtro.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.dataSource.filter = this.cfdisyService.filtro.value;
        this.dataSource.filterPredicate = this.cfdisyService.filtrarData;
      });
    this.cfdisyService.rfc.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.cfdisyService.reviewRfc();
      });
    this.cfdisyService.tipoRfc.valueChanges.subscribe(() => {
      this.cfdisyService.filtrarRfc();
    });
  }

  detalleXmlFile(xml: any): boolean {
    this.cfdisyService.detalleXmlFile(xml);
    return false;
  }

  deleteXmlFile(uuid: string): boolean {
    this.cfdisyService.removeXmlFile(uuid);
    return false;
  }
}
