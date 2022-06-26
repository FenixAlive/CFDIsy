import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfdisyTableComponent } from './cfdisy-table.component';

describe('CfdisyTableComponent', () => {
  let component: CfdisyTableComponent;
  let fixture: ComponentFixture<CfdisyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CfdisyTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CfdisyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
