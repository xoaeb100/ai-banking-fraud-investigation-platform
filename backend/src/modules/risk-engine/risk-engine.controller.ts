import { Controller } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';

@Controller('risk-engine')
export class RiskEngineController {
  constructor(private readonly riskEngineService: RiskEngineService) {}
}
