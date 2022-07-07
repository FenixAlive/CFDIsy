import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfdisyValidateComponent } from './cfdisy-validate.component';

describe('CfdisyValidateComponent', () => {
  let component: CfdisyValidateComponent;
  let fixture: ComponentFixture<CfdisyValidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CfdisyValidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CfdisyValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
