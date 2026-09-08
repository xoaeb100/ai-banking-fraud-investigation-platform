import { Test, TestingModule } from '@nestjs/testing';
import { FraudProcessingService } from './fraud-processing.service';

describe('FraudProcessingService', () => {
  let service: FraudProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FraudProcessingService],
    }).compile();

    service = module.get<FraudProcessingService>(FraudProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
