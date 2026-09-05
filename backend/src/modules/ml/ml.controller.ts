import { Body, Controller, Post } from '@nestjs/common';

import { MlService } from './ml.service';
import { MlPredictRequestDto } from './dto/ml-predict-request.dto';

@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Post('predict')
  predict(@Body() request: MlPredictRequestDto) {
    return this.mlService.predict(request);
  }
}
