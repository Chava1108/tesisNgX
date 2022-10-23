import { TestBed } from '@angular/core/testing';

import { PoryectosService } from './poryectos.service';

describe('PoryectosService', () => {
  let service: PoryectosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoryectosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
