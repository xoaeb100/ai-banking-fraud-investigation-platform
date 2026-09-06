import { Test, TestingModule } from '@nestjs/testing';
import { RiskEngineController } from './risk-engine.controller';
import { RiskEngineService } from './risk-engine.service';

describe('RiskEngineController', () => {
  let controller: RiskEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskEngineController],
      providers: [RiskEngineService],
    }).compile();

    controller = module.get<RiskEngineController>(RiskEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
