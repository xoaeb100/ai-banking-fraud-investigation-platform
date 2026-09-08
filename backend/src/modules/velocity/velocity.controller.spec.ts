import { Test, TestingModule } from '@nestjs/testing';
import { VelocityController } from './velocity.controller';
import { VelocityService } from './velocity.service';

describe('VelocityController', () => {
  let controller: VelocityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VelocityController],
      providers: [VelocityService],
    }).compile();

    controller = module.get<VelocityController>(VelocityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
