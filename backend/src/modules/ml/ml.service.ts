import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { MlPredictRequestDto } from './dto/ml-predict-request.dto';
import { MlPredictResponseDto } from './dto/ml-predict-response.dto';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);

  private readonly mlServiceUrl =
    process.env.ML_SERVICE_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  async predict(request: MlPredictRequestDto): Promise<MlPredictResponseDto> {
    try {
      this.logger.log('Calling ML service');

      const response = await firstValueFrom(
        this.httpService.post<MlPredictResponseDto>(
          `${this.mlServiceUrl}/predict`,
          request,
          {
            timeout: 3000,
          },
        ),
      );

      this.logger.log(`ML prediction received: ${response.data.prediction}`);

      return response.data;
    } catch (error) {
      this.logger.error(
        'ML service unavailable',
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException(
        'ML service is currently unavailable',
      );
    }
  }
}
