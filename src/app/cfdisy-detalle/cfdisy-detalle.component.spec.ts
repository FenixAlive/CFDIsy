import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfdisyDetalleComponent } from './cfdisy-detalle.component';

describe('CfdisyDetalleComponent', () => {
  let component: CfdisyDetalleComponent;
  let fixture: ComponentFixture<CfdisyDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CfdisyDetalleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CfdisyDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
