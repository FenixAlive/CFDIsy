import { TestBed } from '@angular/core/testing';

import { CfdisyService } from './cfdisy.service';

describe('CfdisyService', () => {
  let service: CfdisyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CfdisyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
