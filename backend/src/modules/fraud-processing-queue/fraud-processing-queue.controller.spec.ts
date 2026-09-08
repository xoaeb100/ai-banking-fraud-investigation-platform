import { Test, TestingModule } from '@nestjs/testing';
import { FraudProcessingQueueController } from './fraud-processing-queue.controller';
import { FraudProcessingQueueService } from './fraud-processing-queue.service';

describe('FraudProcessingQueueController', () => {
  let controller: FraudProcessingQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FraudProcessingQueueController],
      providers: [FraudProcessingQueueService],
    }).compile();

    controller = module.get<FraudProcessingQueueController>(FraudProcessingQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
