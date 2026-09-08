import { Test, TestingModule } from '@nestjs/testing';
import { InvestigationCaseService } from './investigation-case.service';

describe('InvestigationCaseService', () => {
  let service: InvestigationCaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestigationCaseService],
    }).compile();

    service = module.get<InvestigationCaseService>(InvestigationCaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
