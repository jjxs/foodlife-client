import { TestBed, inject } from '@angular/core/testing';

import { AmiService } from '../ami.service';

describe('AmiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AmiService]
    });
  });

  it('should be created', inject([AmiService], (service: AmiService) => {
    expect(service).toBeTruthy();
  }));
});
