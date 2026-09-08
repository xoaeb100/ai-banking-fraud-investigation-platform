import { Test, TestingModule } from '@nestjs/testing';
import { InvestigationCaseController } from './investigation-case.controller';
import { InvestigationCaseService } from './investigation-case.service';

describe('InvestigationCaseController', () => {
  let controller: InvestigationCaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestigationCaseController],
      providers: [InvestigationCaseService],
    }).compile();

    controller = module.get<InvestigationCaseController>(InvestigationCaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
