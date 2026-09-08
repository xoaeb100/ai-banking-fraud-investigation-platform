import { Test, TestingModule } from '@nestjs/testing';
import { FraudProcessingQueueService } from './fraud-processing-queue.service';

describe('FraudProcessingQueueService', () => {
  let service: FraudProcessingQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FraudProcessingQueueService],
    }).compile();

    service = module.get<FraudProcessingQueueService>(FraudProcessingQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
