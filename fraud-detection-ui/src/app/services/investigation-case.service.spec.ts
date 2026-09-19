import { TestBed } from '@angular/core/testing';

import { InvestigationCaseService } from './investigation-case.service';

describe('InvestigationCaseService', () => {
  let service: InvestigationCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestigationCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
