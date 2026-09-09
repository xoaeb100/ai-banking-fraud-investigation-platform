import { Test, TestingModule } from '@nestjs/testing';
import { RagInjestionService } from './rag-injestion.service';

describe('RagInjestionService', () => {
  let service: RagInjestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RagInjestionService],
    }).compile();

    service = module.get<RagInjestionService>(RagInjestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
